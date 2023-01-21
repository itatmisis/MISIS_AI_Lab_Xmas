import pickle
from enum import Enum
from pathlib import Path
from typing import List, Dict, Tuple
import re
import pandas as pd
import razdel
import tika
import torch
from catboost import CatBoostClassifier, Pool
from pymystem3 import Mystem
from sklearn.feature_extraction.text import TfidfVectorizer
from tika import parser
import numpy as np
import torch.nn.functional as F

from pydantic import BaseModel
from torch import nn
from tqdm.auto import tqdm
from transformers import DataCollatorWithPadding, AutoTokenizer, AutoModel, RobertaModel, RobertaConfig

stem = Mystem()


class Word(BaseModel):
    word: str
    importance: float


class Paragraph(BaseModel):
    words: List[Word]


class ModelOutputsForClass(BaseModel):
    tfidf_top_good: List[Tuple[str, float]]
    tfidf_top_bad: List[Tuple[str, float]]
    probability: float
    top_phrases: List[str]


class ModelOutputsBert(BaseModel):
    probability: float
    top_phrases: List[str]


class ModelOutputs(BaseModel):
    task_id: int
    predicted_class: str
    outputs_for_class: Dict[str, ModelOutputsForClass]


class ModelInputs(BaseModel):
    task_id: int
    doc_path: str


_re_space = re.compile(r'\s+')
_re_under = re.compile('_+')


def preprocess_str(s: str) -> str:
    s = _re_space.sub(' ', s)
    s = _re_under.sub('__', s)
    return s.strip()


def sentenize(x: str) -> List[str]:
    return [x.text for x in razdel.sentenize(x)]


def lemmatize(s: str) -> str:
    return ' '.join(stem.lemmatize(s))


_N_MODELS = 5
_TARGET_LIST = ['Договоры для акселератора/Договоры купли-продажи',
                'Договоры для акселератора/Договоры оказания услуг',
                'Договоры для акселератора/Договоры аренды',
                'Договоры для акселератора/Договоры подряда',
                'Договоры для акселератора/Договоры поставки']


class ModelClassify(nn.Module):
    def __init__(self, config_path: Path):
        super().__init__()
        self._bert = AutoModel.from_config(RobertaConfig.from_json_file(config_path))
        self._n_cls = len(_TARGET_LIST)
        self._cls = nn.Linear(1024, self._n_cls)

    def forward(self, input_ids, attention_mask):
        x = self._bert(input_ids=input_ids, attention_mask=attention_mask, ).pooler_output
        x = self._cls(x)
        return x


class Predictor:
    def __init__(self, model_dir: Path):
        tika.initVM()
        self._tokenizer = AutoTokenizer.from_pretrained(model_dir / 'tokenizer')
        self._collator = DataCollatorWithPadding(self._tokenizer, return_tensors='pt')
        self._model = ModelClassify(model_dir / 'config' / 'config.json')
        self._model.eval()
        self._model.load_state_dict(torch.load(model_dir / 'model.pt', map_location=next(self._model.parameters()).device))
        self._catboosts = []
        self._tfidfs = []
        for i in range(_N_MODELS):
            with (model_dir / 'vectorizer' / f'{i}.pkl').open('rb') as f_io:
                vec = pickle.load(f_io)
            mdl = CatBoostClassifier().load_model(model_dir / 'catboost' / f'{i}.cbm')
            self._catboosts.append(mdl)
            self._tfidfs.append(vec)

    def make_prediction_catboost(self, doc):
        predicts = []
        importances_all = []
        doc = lemmatize(doc)
        for mdl, vec in zip(self._catboosts, self._tfidfs):
            features = vec.transform([doc])
            feature_names = vec.get_feature_names_out()
            cb_pool = Pool(features)
            cb_results = mdl.predict_proba(cb_pool)[0]
            cb_importance = mdl.get_feature_importance(cb_pool, type='ShapValues')[0, :, :-1]
            importance = pd.DataFrame(data=cb_importance.T, index=feature_names, columns=_TARGET_LIST)
            result = pd.Series(data=cb_results, index=_TARGET_LIST)
            importances_all.append(importance)
            predicts.append(result)
        predicts = pd.concat(predicts).reset_index().groupby('index').mean()[0]
        importances_all = pd.concat(importances_all, axis=0).reset_index().groupby('index').sum()
        out_for_class = {}
        for tgt in _TARGET_LIST:
            proba = predicts[tgt]
            shapley = importances_all[tgt].sort_values()
            shapley_bad = shapley[shapley < -0.2][:10]
            shapley_good = shapley[shapley > 0.2][-10:]
            shapley_bad = list(zip(shapley_bad.index, [x.item() for x in shapley_bad.values]))
            shapley_good = list(zip(shapley_good.index, [x.item() for x in shapley_good.values]))
            out_for_class[tgt] = [shapley_good[::-1], shapley_bad]
        return out_for_class

    def make_phrases(self, text, batch_size_tokens=512 * 4):
        all_outputs = []
        with torch.inference_mode():
            sentences = sentenize(text)
            tokenized = self._tokenizer(sentences, truncation=True).data['input_ids']
            tokenized = [(tkn, sent) for tkn, sent in zip(tokenized, sentences)]
            tokenized = sorted(tokenized, key=lambda x: len(x[0]))
            batches = []
            curr_batch = []
            for tkns, txt in tokenized:
                len_in_tokens = (len(curr_batch) + 1) * len(tkns)
                if len_in_tokens <= batch_size_tokens:
                    curr_batch.append((tkns, txt))
                else:
                    batches.append(curr_batch)
                    curr_batch = [(tkns, txt)]
            if len(curr_batch) > 0:
                batches.append(curr_batch)
            batches_data = [[{'input_ids': y[0], 'attention_mask': [1] * len(y[0])} for y in x] for x in batches]
            batches_data = [self._collator(x).data for x in batches_data]
            batches_texts = [[y[1] for y in x] for x in batches]
            device = next(self._model.parameters()).device
            for batch_data, batch_texts in zip(tqdm(batches_data), batches_texts):
                model_outputs = self._model(batch_data['input_ids'].to(device), batch_data['attention_mask'].to(device))
                model_outputs = F.softmax(model_outputs, dim=1)
                for model_output, text in zip(model_outputs, batch_texts):
                    all_outputs.append({
                        'text': text,
                        **{f'{_TARGET_LIST[i]}': score.item() for i, score in enumerate(model_output)}
                    })
            return pd.DataFrame(all_outputs)

    def make_summary(self, df):
        phrases_for_class = {}
        total_scores = df[_TARGET_LIST].mean()
        decision = total_scores.index[total_scores.argmax()]
        total_scores = {k: round(v, 3) for k, v in total_scores.to_dict().items()}
        for class_name in _TARGET_LIST:
            df_class = df[['text', class_name]]
            df_class = df_class.sort_values(by=class_name, ascending=False)
            df_class_out = df_class[df_class[class_name] > 0.9]
            if decision == class_name and len(df_class_out) == 0:  # пессимистичный кейс
                df_class_out = df_class.iloc[[0]]
            phrases_for_class[class_name] = df_class_out['text'].tolist()
        return decision, total_scores, phrases_for_class

    def process(self, inputs: ModelInputs) -> ModelOutputs:
        doc = preprocess_str(parser.from_file(str(Path('docs') / inputs.doc_path))['content'])
        results_cb = self.make_prediction_catboost(doc)
        summary = self.make_summary(self.make_phrases(doc))
        return ModelOutputs(
            task_id=inputs.task_id,
            predicted_class=summary[0],
            outputs_for_class={x: ModelOutputsForClass(
                probability=summary[1][x],
                top_phrases=summary[2][x],
                tfidf_top_good=results_cb[x][0],
                tfidf_top_bad=results_cb[x][1]
            ) for x in _TARGET_LIST}
        )


if __name__ == '__main__':
    pred = Predictor(Path('./model'))
    ins = ModelInputs(task_id=0, doc_path='2b25ecf601a9ce0c2a33c8e1d9746df2.doc')
    res = pred.process(ins)
    with (Path('output') / Path(ins.doc_path).with_suffix('.json')).open('w') as f:
        f.write(res.json(indent=4, ensure_ascii=False))
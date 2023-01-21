FROM python:3.9
RUN apt-get update && apt-get install -y git make automake gcc g++ subversion default-jre
RUN pip3 install git+https://github.com/mrapplexz/tika-python scikit-learn catboost numpy pandas pydantic pika razdel pymystem3 transformers tokenizers torch tqdm --extra-index-url https://download.pytorch.org/whl/cpu
WORKDIR /opt
COPY model ./model
COPY . .
WORKDIR /opt
ENTRYPOINT ["python3", "listener.py"]
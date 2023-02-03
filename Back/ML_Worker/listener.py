import sys

import pika
from predictor import Predictor, ModelInputs
from pathlib import Path
import requests
import os

host_name = os.environ.get("RABBITMQ.HOSTNAME")
virtual_host = os.environ.get("RABBITMQ.VIRUALHOST")
user_name = os.environ.get("RABBITMQ.USERNAME")
password = os.environ.get("RABBITMQ.PASSWORD")
predict_queue = os.environ.get("RABBITMQ.PREDICTQUEUE")

crud_api_host = os.environ.get("CRUD.API.HOST")
crud_api_port = os.environ.get("CRUD.API.PORT")




if __name__ == '__main__':
    credentials = pika.PlainCredentials(user_name, password)
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=host_name, port='5672', credentials= credentials))
    channel = connection.channel()
    pred = Predictor(Path('./model'))

    def callbackFunctionForQueueA(ch, method, properties, body):
        try:
            print(f'Start processing')
            ins = ModelInputs.parse_raw(body)
            result = pred.process(ins)
            print(f'got result')
            try:
                requests.post(f'{crud_api_host}:{crud_api_port}/save_predict?document_id={result.task_id}&extra_info=_&type_id={result.predicted_class}', data={})
                print("send result to crud api")
            except Exception as ex:
                print(ex)
            with (Path('output') / Path(ins.doc_path).with_suffix('.json')).open('w') as f:
                f.write(result.json(indent=4, ensure_ascii=False))
        except Exception as e:
            print(e, file=sys.stderr)
    print('started listening guys')
    channel.basic_consume(queue= predict_queue, on_message_callback=callbackFunctionForQueueA, auto_ack=True)
    channel.start_consuming()
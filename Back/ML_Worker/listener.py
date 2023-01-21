import sys

import pika
from predictor import Predictor, ModelInputs
from pathlib import Path
import os

host_name = os.environ.get("RABBITMQ.HOSTNAME")
virtual_host = os.environ.get("RABBITMQ.VIRUALHOST")
user_name = os.environ.get("RABBITMQ.USERNAME")
password = os.environ.get("RABBITMQ.PASSWORD")
predict_queue = os.environ.get("RABBITMQ.PREDICTQUEUE")



if __name__ == '__main__':
    credentials = pika.PlainCredentials(user_name, password)
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=host_name, port='5672', credentials= credentials))
    channel = connection.channel()
    pred = Predictor(Path('./model'))

    def callbackFunctionForQueueA(ch, method, properties, body):
        try:
            ins = ModelInputs.parse_raw(body)
            result = pred.process(ins).json(indent=4, ensure_ascii=False)
            with (Path('output') / Path(ins.doc_path).with_suffix('.json')).open('w') as f:
                f.write(result)
        except Exception as e:
            print(e, file=sys.stderr)
    print('started listening guys')
    channel.basic_consume(queue= predict_queue, on_message_callback=callbackFunctionForQueueA, auto_ack=True)
    channel.start_consuming()

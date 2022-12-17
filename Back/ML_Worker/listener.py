import sys

import pika
from predictor import Predictor, ModelInputs
from pathlib import Path


if __name__ == '__main__':
    credentials = pika.PlainCredentials('xmasuser','xmaspassword')
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='62.84.127.116', port='5672', credentials= credentials))
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
    channel.basic_consume(queue='predict', on_message_callback=callbackFunctionForQueueA, auto_ack=True)
    channel.start_consuming()

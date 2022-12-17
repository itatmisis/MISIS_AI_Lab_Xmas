from fastapi import FastAPI
from dotenv import load_dotenv
from os.path import join, dirname
from peewee import *
import requests
from email.mime.multipart import MIMEMultipart  # Многокомпонентный объект
from email.mime.text import MIMEText  # Текст/HTML
from os.path import basename
from email.mime.application import MIMEApplication
import uvicorn
import smtplib, ssl
import os

HOST = "0.0.0.0"
PORT = 8000

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
EMAIL_LOGIN = os.environ.get("EMAIL_LOGIN")

credintials = {
    "host": os.environ.get("POSTGRES_HOST"),
    "port": os.environ.get("POSTGRES_PORT"),
    "user": os.environ.get("POSTGRES_USER"),
    "password": os.environ.get("POSTGRES_PASSWORD"),
    "database": os.environ.get("POSTGRES_DB")
}


db = PostgresqlDatabase(**credintials)
db.connect()


class document(Model):
    id = IntegerField(primary_key=True)
    name = TextField()
    path = TextField()
    status = IntegerField(null=True)

    class Meta:
        database = db
        database_table = 'document'


class document_type(Model):
    id = IntegerField(primary_key=True)
    name = TextField()

    class Meta:
        database = db
        database_table = 'document_type'


class predict(Model):
    id = IntegerField(primary_key=True)
    document_id = ForeignKeyField(document)
    type_id = ForeignKeyField(document_type)
    extra_info = TextField(null=True)

    class Meta:
        database = db
        database_table = 'predict'


class email_doctype_rel(Model):
    id = IntegerField(primary_key=True)
    type_id = ForeignKeyField(document_type)
    email = TextField()

    class Meta:
        database = db
        database_table = 'email_doctype_rel'


app = FastAPI(title="XMAS HACK - 'MISIS AI LAB' team")


@app.post("/insert_doctype",
          description="Создать новый тип документа в базе данных")
async def insert_doctype(type_name: str):
    try:
        document_type.delete().where(document_type == type_name).execute()
        doctype = document_type()
        doctype.name = type_name
        doctype.save()
    except Exception as e:
        return {"Error": str(e)}
    return {
        "Message": "Successful",
        "doctype_id": doctype.id, "type_name": type_name
    }


def send_email(addr_to: str, theme: str, message: str, pdf_path: str):
    addr_from = EMAIL_LOGIN
    password = EMAIL_PASSWORD

    msg = MIMEMultipart()
    msg['From'] = addr_from
    msg['To'] = addr_to
    msg['Subject'] = theme

    try:
        with open(pdf_path, "rb") as file:
            part = MIMEApplication(
                file.read(),
                Name=basename(pdf_path)
            )
            part['Content-Disposition'] = f'attachment; filename="{basename(pdf_path)}"'
            msg.attach(part)
    except Exception as e:
        print('Файл не найден')
        print(e)

    msg.attach(MIMEText(message, 'plain'))

    server = smtplib.SMTP_SSL('smtp.yandex.ru', 465)
    server.login(addr_from, password)
    server.send_message(msg)
    server.quit()

    return {
        'message': 'Successful',
        'from': EMAIL_LOGIN,
        'to': addr_to,
        'message_text': message
    }

@app.post("/save_predict", description=("Сохранить предсказание модели"
                                        "(указывается ID типа либо имя типа)"
                                        "для документа"))
async def save_predict(document_id, extra_info: str,
                       type_id=None, type_name: str = None):
    try:
        predict.delete().where(predict.document_id == document_id).execute()
        pred = predict()
        pred.document_id = document_id
        pred.extra_info = extra_info
        if type_name:
            pred.type_id = document_type.select(document_type.id) \
                .where(document_type.name == type_name)
        elif type_id:
            pred.type_id = type_id
        pred.save()
    except Exception as e:
        print(e)
        return {"status_code": 400, "describe": "Ошибка при сохранении"}

    try:
        email = email_doctype_rel.select() \
            .where(email_doctype_rel.type_id == type_id).get().email
    except Exception as e:
        print('Ошибка при получении email')
        print(str(e))
        email = None

    doc_name = document.select().where(document.id == document_id).get().name
    doc_path = document.select().where(document.id == document_id).get().path

    msg_text = (f'Добрый день, уважаемые коллеги!\n\n'
                f'Отправляем вам необходимые документы: '
                f'{doc_name}\n\n'
                f'Если документ получен ошибочно, перейдите по ссылке [source].\n\n'
                f'С уважением, команда MISIS AI Lab!')

    print(email)

    if email:
        try:
            sending_info = send_email(addr_to=email,
                                      theme='Документы',
                                      message=msg_text,
                                      pdf_path='/documents/' + doc_path)
            print('Письмо успешно отправлено!')
        except Exception as e:
            print('Ошибка при отправке письма!')
            print(str(e))

    return {
        "message": "Successful",
        "pred_id": pred.id,
        "document_id": pred.document_id.id,
    }


@app.post("/save_doc", description="Сохраняет новый документ")
async def save_doc(name: str, path: str):
    try:
        doc = document()
        doc.name = name
        doc.path = path
        doc.save()
    except Exception as e:
        return {"status_code": 400, "error": str(e)}
    return {
        "message": "Successful", "id": doc.id,
        "name": doc.name, "path": doc.path
    }


@app.post("/save_email_relation",
          description=("Сохраняет новый email и привязывает"
                       " к нему определенный тип документа"))
async def save_email_relation(email: str, type_id):
    try:
        etype_rel = email_doctype_rel()
        etype_rel.email = email
        etype_rel.type_id = type_id
        etype_rel.save()
    except Exception as e:
        return {"status_code": 400, "error": str(e)}

    return {
        "message": "Successful", "id": etype_rel.id,
        "email": etype_rel.email, "type_id": etype_rel.type_id.id
    }


@app.post("/delete_email_relation",
          description=("Удаляет связь email и типа документа"))
async def delete_email_relation(id):
    try:
        q = email_doctype_rel.delete().where(email_doctype_rel.id == id)
        q.execute()
    except Exception as e:
        return {"status_code": 400, "error": str(e)}

    return {
        "message": "Successful",
        "id": id,
    }


@app.post("/change_status", description="Изменяет статус")
async def change_status(id, status):
    try:
        doc = document()
        doc.id = id
        doc.status = status
        doc.save()
    except Exception as e:
        return {"status_code": 400, "error": str(e)}
    return {"message": "Successful", "id": doc.id}


@app.get("/get_all_docs", description=("Возвращает список всех документов,"
                                       "их параметров и предсказаний модели"))
async def get_all_docs():
    docs = document.select()
    data = []
    try:
        for doc in docs:
            query = predict.select() \
                .join(document_type, on=(document_type.id == predict.type_id)) \
                .where(predict.document_id == int(doc.id))

            try:
                type_name = query.get().type_id.name
            except Exception:
                type_name = None

            try:
                extra_info = query.get().extra_info
            except Exception:
                extra_info = None

            data.append({
                "id": doc.id,
                "name": doc.name,
                "path": doc.path,
                "status": doc.status,
                "type": type_name,
                "extra_info": extra_info
            })
    except Exception as e:
        return {"status_code": 400, "error": str(e)}

    return {"message": "Successful", "documents": data}


@app.get("/get_all_types", description=("Возвращает список всех типов документов"))
async def get_all_types():
    try:
        types = document_type.select()
        data = []
        for type in types:
            data.append({
                "id": type.id,
                "name": type.name,
            })
    except Exception as e:
        return {"status_code": 400, "error": str(e)}
    return {"Message": "Successful", "types": data}


@app.get("/get_all_email_doctype_rel",
         description=("Возвращает список всех email - type_id"))
async def get_all_email_doctype_rel():
    try:
        rels = email_doctype_rel.select()  # relations
        data = []
        for rel in rels:
            data.append({
                "id": rel.id,
                "email": rel.email,
                "type_id": rel.type_id.id,
                "type_name": rel.type_id.name
            })
    except Exception as e:
        return {"status_code": 400, "error": str(e)}
    return {"Message": "Successful", "data": data}


if __name__ == "__main__":
    uvicorn.run("app:app", host=HOST, port=PORT, reload=True)

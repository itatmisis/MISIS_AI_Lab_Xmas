FROM python:3.9

# 
WORKDIR /code

# 
COPY ./Back/Crud.API/requirements.txt /code/requirements.txt


# 
RUN pip install -r /code/requirements.txt

# 
COPY ./Back/Crud.API/ /code

# 
CMD ["python", "app.py"]
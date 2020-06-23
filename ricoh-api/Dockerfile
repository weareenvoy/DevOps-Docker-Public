FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD [ "/usr/local/bin/gunicorn", "ricohapi.app:app", "--bind", "0.0.0.0:8000" ]

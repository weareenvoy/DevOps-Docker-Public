from flask import Flask, jsonify, request
from printers import Ricoh

from ricohapi import app
from ricohapi.client import PrinterClient


app = Flask(__name__)

@app.route('/users', methods=('GET',))
def users():
    printer = int(request.args.get('printer', 0))
    return jsonify(list(PrinterClient(printer).get_users()))

@app.route('/users/<id>', methods=('GET',))
def user(id):
    printer = int(request.args.get('printer', 0))
    user = PrinterClient(printer).get_user(id)
    if user:
        return jsonify(user)
    return (jsonify({}), 404)

@app.route('/users', methods=('POST',))
def add_user():
    if PrinterClient().get_user(request.get_json()['email']):
        return ('', 409)
    return (jsonify(PrinterClient().add_user(request.get_json())), 201)

@app.route('/users/<id>', methods=('DELETE',))
def delete_user(id):
    PrinterClient().delete_user(id)
    return ('', 204)

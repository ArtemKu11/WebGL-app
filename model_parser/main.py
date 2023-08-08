from flask import Flask, request
from flask_cors import CORS
from parser_stl import STLParser
import json
from numpy_stl_parser import parseSTL
import os

app = Flask(__name__)
CORS(app)

class ParsingError(Exception):
    def __init__(self, message, logs=None):
        if logs is None:
            logs = []
        Exception(message)
        self.logs = logs

@app.route('/')
def index():
    return 'alalala'


@app.post('/parse_stl')
def parse_stl():
    file = request.files.get('file')
    if file:
        original_filename = file.filename.lower()
        if original_filename.endswith('.obj'):
            print('obj parser')
        elif original_filename.endswith('.stl'):
            # web_gl_data = STLParser().parseSTLBinaryIO(file.stream)
            path = f'./temp/{original_filename}'
            file.save(path)
            web_gl_data = parseSTL(path)
            os.remove(path)
            return web_gl_data.to_json()
        else:
            raise ValueError('Недопустимый формат файла. Используйте .obj или .stl')
        # file_stream = file.stream
        # lines = file_stream.read().decode('utf-8').split('\n')
        # file_stream.close()
        # print(lines)
        # for line in lines:
        #     print(line)
    # raise ParsingError('Интернальная ошибка сервера', logs=[])
    return 'alalala'


@app.errorhandler(ParsingError)
def parsing_error_handler(e: ParsingError):
    return {"message": e.__str__(), "logs": e.logs}, 500

@app.errorhandler(ValueError)
def мalue_error_handler(e: ValueError):
    return {"message": e.__str__(), "logs": []}, 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

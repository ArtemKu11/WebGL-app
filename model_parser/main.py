from flask import Flask, request
from flask_cors import CORS
import os
from stl_parser import parse_stl_file
from obj_parser import ObjParser
from dto import ParsingError, FileFormatError, DefaultServerAnswer

app = Flask(__name__)
CORS(app)


def check_temp_dir():
    path = './temp'
    if not os.path.exists(path):
        os.mkdir(path)


check_temp_dir()


@app.route('/')
def index():
    return 'alalala'


@app.post('/parse_stl')
def parse_stl():
    file = request.files.get('file')
    if file:
        original_filename = file.filename.lower()
        if original_filename.endswith('.obj'):
            file_stream = file.stream
            object_code = file_stream.read().decode('utf-8')
            file_stream.close()
            web_gl_data, logs = ObjParser(object_code).parse_object()
            answer = DefaultServerAnswer(web_gl_data, logs)
            return answer.to_json()
        elif original_filename.endswith('.stl'):
            path = f'./temp/{original_filename}'
            file.save(path)
            web_gl_data = parse_stl_file(path)
            os.remove(path)
            answer = DefaultServerAnswer(web_gl_data, [])
            return answer.to_json()
        else:
            raise FileFormatError('Недопустимый формат файла. Используйте .obj или .stl')
    return 'alalala'


@app.errorhandler(ParsingError)
def parsing_error_handler(e: ParsingError):
    return {"message": e.__str__(), "logs": e.logs}, 500


@app.errorhandler(FileFormatError)
def file_format_error_handler(e: FileFormatError):
    return {"message": e.__str__(), "logs": []}, 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

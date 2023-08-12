from copy import deepcopy
from typing import Callable
from . import Coordinate3D, Coordinate2D, PointDescription, Face
from dto import ParsingError, WebGLData


def parse_int(str_int: str) -> int | None:
    try:
        parsed_float = float(str_int)
    except ValueError:
        return None
    return round(parsed_float)


class ObjParser:
    __object_code: str
    __keyword_handlers: dict[str, Callable[[str], None]]  # key - str, value - func
    __raw_vertices: list[Coordinate3D]
    __raw_textures: list[Coordinate2D]
    __raw_normals: list[Coordinate3D]
    __faces: list[Face]
    __vertices: list[float]
    __textures: list[float]
    __normals: list[float]
    __logs: list[str]

    def __init__(self, object_code: str):
        self.__logs = []
        self.__object_code = object_code
        self.__keyword_handlers = dict()
        self.__raw_vertices = []
        self.__raw_textures = []
        self.__raw_normals = []
        self.__faces = []
        self.__vertices = []
        self.__textures = []
        self.__normals = []
        self.__init_keyword_handlers()

    def parse_object(self) -> tuple[WebGLData, list[str]]:
        lines = self.__object_code.split('\n')  # Разбить по переносу строк
        lines = list(map(lambda x: x.strip(), lines))  # Удалить пробелы
        lines = list(filter(lambda x: not x.startswith("#") and x != "", lines))  # Удалить комментарии и пустые строки

        for line in lines:  # Создать rawVertices, rawTextures, rawNormal, faces
            keyword = self.__get_first_word_in_line(line)
            handler = self.__keyword_handlers.get(keyword)
            if handler:
                handler(line)
            else:
                self.__logs.append(f"Неизвестное ключевое слово: {keyword}")
        self.__parse_raw_data()

        if self.__vertices:
            result = WebGLData(vertices=self.__vertices)
        else:
            message = 'PARSING FAIL. Не найдено вершин'
            self.__logs.append(message)
            raise ParsingError(message, logs=self.__logs)

        if self.__textures:
            result.textures = self.__textures
        if self.__normals:
            result.normals = self.__normals

        self.__result_check(result)
        return result, self.__logs

    def __result_check(self, result: WebGLData) -> bool:
        if len(result.vertices) % 9 != 0:
            message = 'PARSING FAIL. Количество вершин не кратно 9 (Не треугольники)'
            self.__logs.append(message)
            raise ParsingError(message, logs=self.__logs)
        if result.normals and len(result.vertices) != len(result.normals):
            message = f'PARSING FAIL. Не совпадает количество вершин ({len(result.vertices)}) и нормалей ({len(result.normals)})'
            self.__logs.append(message)
            raise ParsingError(message, logs=self.__logs)
        if result.textures and (len(result.vertices) / 3) * 2 != len(result.textures):
            message = f'PARSING FAIL. Не совпадает количество вершин (${len(result.vertices)}) и текстур (${len(result.textures)})'
            self.__logs.append(message)
        return True

    def __parse_raw_data(self) -> None:
        for face in self.__faces:
            for point_description in face.point_descriptions:

                vertex_number = point_description.vertex
                try:
                    vertex = self.__raw_vertices[vertex_number]
                    self.__vertices.extend([vertex.x, vertex.y, vertex.z])
                except IndexError:
                    self.__logs.append(f"UNABLE TO FIND VERTEX: {vertex_number}")

                texture_number = point_description.texture
                if texture_number is not None:
                    try:
                        texture = self.__raw_textures[texture_number]
                        self.__textures.extend([texture.x, texture.y])
                    except IndexError:
                        self.__logs.append(f"UNABLE TO FIND TEXTURE: {texture_number}")

                normal_number = point_description.normal
                if normal_number is not None:
                    try:
                        normal = self.__raw_normals[normal_number]
                        self.__normals.extend([normal.x, normal.y, normal.z])
                    except IndexError:
                        self.__logs.append(f"UNABLE TO FIND NORMAL: {normal_number}")

    def __init_keyword_handlers(self) -> None:
        self.__keyword_handlers["v"] = self.__v_handler
        self.__keyword_handlers["vn"] = self.__vn_handler
        self.__keyword_handlers["vt"] = self.__vt_handler
        self.__keyword_handlers["f"] = self.__f_handler

    def __v_handler(self, line: str) -> None:
        parsed_coords = self.__parse_3d_coords(line)
        if parsed_coords:
            self.__raw_vertices.append(parsed_coords)
        else:
            self.__logs.append(f'PARSING FAIL: {line}')

    def __vn_handler(self, line: str) -> None:
        parsed_coords = self.__parse_3d_coords(line)
        if parsed_coords:
            self.__raw_normals.append(parsed_coords)
        else:
            self.__logs.append(f'PARSING FAIL: {line}')

    def __vt_handler(self, line: str) -> None:
        parsed_coords = self.__parse_2d_coords(line)
        if parsed_coords:
            self.__raw_textures.append(parsed_coords)
        else:
            self.__logs.append(f'PARSING FAIL: {line}')

    def __f_handler(self, line: str) -> None:  # Пример линии f 1/1/1 5/5/1 7/9/1 3/3/1, где вершина/текстура/нормаль
        parameters = self.__exclude_keyword_and_split(line)
        if parameters:
            face = Face()
            for parameter in parameters:
                parsed_parameter = parameter.split('/')
                if parsed_parameter:
                    parsed_vertex = parse_int(parsed_parameter[0])
                    parsed_texture = parse_int(parsed_parameter[1])
                    parsed_normal = parse_int(parsed_parameter[2])
                    if parsed_vertex is None:
                        self.__logs.append(f"PARSING FAIL: {line}")
                        break
                    point_description = self.__create_point_description(parsed_vertex, parsed_texture, parsed_normal)
                    face.point_descriptions.append(point_description)
                    if len(face.point_descriptions) % 3 == 0:
                        face.point_descriptions.append(deepcopy(point_description))
                else:
                    self.__logs.append(f"PARSING FAIL: {line}")
                    break
            if face.point_descriptions:
                counter = 0
                while len(face.point_descriptions) % 3 != 0:
                    if counter >= len(face.point_descriptions):
                        counter = 0
                        continue
                    point_description = deepcopy(face.point_descriptions[counter])
                    face.point_descriptions.append(point_description)
                    counter += 1
                self.__faces.append(face)
        else:
            self.__logs.append(f"PARSING FAIL: {line}")

    @staticmethod
    def __create_point_description(vertex: int, texture: int | None, normal: int | None) -> PointDescription:
        point_description = PointDescription(vertex=vertex - 1)
        if texture is not None:
            point_description.texture = texture - 1
        if normal is not None:
            point_description.normal = normal - 1
        return point_description

    @staticmethod
    def __get_first_word_in_line(line: str) -> str:
        try:
            space_index = line.index(" ")
            return line[0: space_index]
        except ValueError:
            return line

    @staticmethod
    def __exclude_keyword_and_split(line: str) -> list[str]:
        line_arr = line.split(' ')
        if line_arr:
            return line_arr[1:]
        else:
            return line_arr

    def __parse_3d_coords(self, line: str) -> Coordinate3D | None:  # Пример линии: keyword 0.0 0.0 0.0
        parameters = self.__exclude_keyword_and_split(line)
        if parameters:
            parsed_parameters = []
            for parameter in parameters:
                if parameter == "":
                    continue
                try:
                    parsed_parameter = float(parameter)
                except ValueError:
                    break
                parsed_parameters.append(parsed_parameter)
            if len(parsed_parameters) >= 3:
                return Coordinate3D(x=parsed_parameters[0], y=parsed_parameters[1], z=parsed_parameters[2])
            else:
                return None
        else:
            return None

    def __parse_2d_coords(self, line: str) -> Coordinate2D | None:  # Пример линии: keyword 0.0 0.0
        parameters = self.__exclude_keyword_and_split(line)
        if parameters:
            parsed_parameters = []
            for parameter in parameters:
                if parameter == "":
                    continue
                try:
                    parsed_parameter = float(parameter)
                except ValueError:
                    break
                parsed_parameters.append(parsed_parameter)
            if len(parsed_parameters) >= 2:
                return Coordinate2D(x=parsed_parameters[0], y=parsed_parameters[1])
            else:
                return None
        else:
            return None

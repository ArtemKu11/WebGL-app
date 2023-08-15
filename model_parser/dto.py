import json
from dataclasses import dataclass, field

class ParsingError(Exception):
    def __init__(self, message, logs=None):
        if logs is None:
            logs = []
        Exception(message)
        self.logs = logs


class FileFormatError(Exception):
    pass


@dataclass
class WebGLData:
    vertices: list[float]
    textures: list[float] | None = None
    normals: list[float] | None = None

    def __repr__(self):
        return f'Vertices: {self.vertices},\nTextures: {self.textures}\nNormals: {self.normals}'

    def __add__(self, other):
        if type(other) == type(self):
            self.vertices.extend(other.vertices)
            if other.textures:
                if self.textures:
                    self.textures.extend(other.textures)
                else:
                    self.textures = []
                    self.textures.extend(other.textures)
            if other.normals:
                if self.normals:
                    self.normals.extend(other.normals)
                else:
                    self.normals = []
                    self.normals.extend(other.normals)
        else:
            raise ValueError(f'{type(other)} + {type(self)} не определено')
        return self

    def to_json_dict(self):
        return {
            "vertices": self.vertices,
            "textures": self.textures,
            "normals": self.normals
        }


@dataclass
class DefaultServerAnswer:
    web_gl_data: WebGLData | None
    logs: list[str] = field(default_factory=list)  # []

    def to_json_dict(self):
        return {
            "web_gl_data": self.__jsonify_web_gl_data(),
            "logs": self.logs
        }

    def __jsonify_web_gl_data(self) -> dict[str, list[float] | None] | str:
        if self.web_gl_data is not None:
            return self.web_gl_data.to_json_dict()
        else:
            return "null"

from dataclasses import dataclass

from dto import WebGLData


@dataclass
class Coordinate3D:
    x: float
    y: float
    z: float

    def __repr__(self):
        return f'{self.x}, {self.y}, {self.z}'

    def invert(self):
        self.x = -self.x
        self.y = -self.y
        self.z = -self.z

    def to_list(self) -> list[float]:
        return [self.x, self.y, self.z]


@dataclass
class Face4Point:
    # Положения точек в предположении, что нормаль в лицо
    right_bottom_point: Coordinate3D
    left_bottom_point: Coordinate3D
    right_up_point: Coordinate3D
    left_up_point: Coordinate3D
    normal: Coordinate3D

    def to_web_gl_data(self) -> WebGLData:
        vertices = []
        normals = []
        normals.extend(self.normal.to_list() * 6)
        vertices.extend(self.left_bottom_point.to_list())
        vertices.extend(self.right_bottom_point.to_list())
        vertices.extend(self.right_up_point.to_list())
        vertices.extend(self.right_up_point.to_list())
        vertices.extend(self.left_up_point.to_list())
        vertices.extend(self.left_bottom_point.to_list())
        return WebGLData(vertices=vertices, normals=normals)
from dto import WebGLData
from .trapezoid_creator import TrapezoidCreator


class MeshCreator:
    __trapezoid_creator: TrapezoidCreator

    def __init__(self):
        self.__trapezoid_creator = TrapezoidCreator()

    def create_trapezoid(self, x1: float, y1: float, x2: float, y2: float, z: float, first_height: float,
                         second_height: float, width: float) -> WebGLData:
        return self.__trapezoid_creator.create_trapezoid(x1, y1, x2, y2, z, first_height, second_height, width)


if __name__ == '__main__':
    web_gl_data = MeshCreator().create_trapezoid(x1=0, y1=0, x2=1, y2=0, z=3, first_height=2, second_height=3, width=4)

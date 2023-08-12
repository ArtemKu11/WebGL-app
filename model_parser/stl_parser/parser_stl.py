import struct
from typing import BinaryIO, Any, IO
from dto import WebGLData

# class WebGLData:
#
#     def __init__(self):
#         self.vertices = []
#         self.normals = []
#
#     def __repr__(self):
#         return f'Vertices: {self.vertices},\nNormals: {self.normals}'
#
#     def to_json(self):
#         return {
#             "vertices": self.vertices,
#             "normals": self.normals
#         }


class STLParser:
    __webGLData: WebGLData
    flag = True

    def parse_stl(self, path: str) -> WebGLData:
        f = open(path, 'rb')
        self.parse_stl_binary_io(f)
        f.close()
        return self.__webGLData

    def parse_stl_binary_io(self, binary: BinaryIO | IO[bytes]) -> WebGLData:
        number_of_triangles = self.__get_number_of_triangles(binary)
        buffer = binary.read(number_of_triangles * 50)
        self.__webGLData = WebGLData(vertices=[], normals=[])
        for i in range(0, number_of_triangles):
            buffer = self.__parse_triangle(buffer)
        return self.__webGLData

    def __parse_triangle(self, buffer: bytes) -> bytes:
        floats, buffer = self.__read_4_byte_float(buffer, 12)
        buffer = buffer[2:]
        normal = floats[:3]
        vertex1 = floats[3:6]
        vertex2 = floats[6:9]
        vertex3 = floats[9:19]
        if self.flag:
            print(normal)
            self.flag = False
        self.__webGLData.vertices.extend(vertex1)
        self.__webGLData.normals.extend(normal)
        self.__webGLData.vertices.extend(vertex2)
        self.__webGLData.normals.extend(normal)
        self.__webGLData.vertices.extend(vertex3)
        self.__webGLData.normals.extend(normal)
        return buffer

    def __get_number_of_triangles(self, file: BinaryIO) -> int:
        buffer = file.read(84)
        ints, buffer = self.__read_4_byte_int(buffer[80:])
        return ints[0]

    def __read_4_byte_float(self, buffer: bytes, n=1) -> tuple[tuple[Any, ...], int | bytes]:
        floats = struct.unpack('f' * n, buffer[:4 * n])
        new_buffer = buffer[4 * n:]
        return floats, new_buffer

    def __read_2_byte_int(self, buffer: bytes, n=1) -> tuple[tuple[Any, ...], int | bytes]:
        ints = struct.unpack('h' * n, buffer[:2 * n])
        new_buffer = buffer[2 * n:]
        return ints, new_buffer

    def __read_4_byte_int(self, buffer: bytes, n=1) -> tuple[tuple[Any, ...], int | bytes]:
        ints = struct.unpack('<i' * n, buffer[:4 * n])
        new_buffer = buffer[4 * n:]
        return ints, new_buffer


if __name__ == '__main__':
    result = STLParser().parse_stl('./some_stl.stl')
    print(result)

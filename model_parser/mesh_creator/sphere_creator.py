import math
import numpy as np
from .dto import Coordinate3D, WebGLData


class SphereCreator:
    def create_sphere(self, diameter: float, x=0, y=0, z=0):
        if not diameter or diameter <= 0:
            print('Диаметер должен быть положительным числом. Меш не считаю')
            return
        radius = diameter / 2
        circle_length = 2 * math.pi * radius
        points_count = round(circle_length / (diameter / 20))
        # points_count = 16
        while points_count % 4 != 0:
            points_count += 1
        # radii от radius до 0 не включительно
        # z_coords от 0 до radius не включительно
        radii, z_coords = self.__calculate_radii(radius, points_count)
        points = []

        for i in range(0, len(radii)):
            z_points = []
            z_points.extend(self.__calculate_circle(radii[i], points_count, z_coords[i], x, y, z))
            points.append(z_points)
        upper_mesh = self.__create_upper_mesh(points, radius, x, y, z)

        points = []
        for i in range(len(radii) - 1, -1, -1):
            z_points = []
            z_points.extend(self.__calculate_circle(radii[i], points_count, -z_coords[i], x, y, z))
            points.append(z_points)
        down_mesh = self.__create_down_mesh(points, radius, x, y, z)
        return upper_mesh + down_mesh
        # return down_mesh

    def __calculate_radii(self, radius: float, count: int):
        points_1 = self.__calculate_1_or_3_square_points(radius, 0, 0, int(count / 4), 0)
        radii = [radius]
        z_coords = [0]
        for point in points_1:
            radii.append(point.x)
            z_coords.append(point.y)
        radii = radii[:-1]
        z_coords = z_coords[:-1]
        return radii, z_coords

    def __create_down_mesh(self, down_points: list[list[Coordinate3D]], radius: float,
                           x: float, y: float, z: float) -> WebGLData:
        last_points = down_points[-1]
        web_gl_data = WebGLData([], normals=[])
        for i in range(len(down_points) - 1, -1, -1):
            current_points = down_points[i]
            web_gl_data += self.__create_two_diameters_mesh(last_points, current_points, False)
            last_points = current_points
        web_gl_data += self.__create_point_diameter_mesh(down_points[0], -radius, x, y, z, False)
        return web_gl_data

    def __create_upper_mesh(self, upper_points: list[list[Coordinate3D]], radius: float,
                            x: float, y: float, z: float) -> WebGLData:
        last_points = upper_points[0]
        web_gl_data = WebGLData([], normals=[])
        for i in range(1, len(upper_points)):
            current_points = upper_points[i]
            web_gl_data += self.__create_two_diameters_mesh(last_points, current_points, True)
            last_points = current_points
        web_gl_data += self.__create_point_diameter_mesh(last_points, radius, x, y, z, True)
        return web_gl_data

    def __create_point_diameter_mesh(self, dia_points: list[Coordinate3D], point_z: float,
                                     x: float, y: float, z: float, is_it_positive_normal: bool) -> WebGLData:
        web_gl_data = WebGLData([], normals=[])
        u_point = Coordinate3D(0 + x, 0 + y, point_z + z)
        for i in range(0, len(dia_points) - 1):
            points = dia_points[0 + i:2 + i]
            l_b_point = points[0]
            r_b_point = points[1]

            vertices, normals = self.__calculate_3_points_mesh(l_b_point, r_b_point, u_point, is_it_positive_normal)
            web_gl_data.vertices.extend(vertices)
            web_gl_data.normals.extend(normals)
        l_b_point = dia_points[0]
        r_b_point = dia_points[-1]
        vertices, normals = self.__calculate_3_points_mesh(l_b_point, r_b_point, u_point, is_it_positive_normal)
        web_gl_data.vertices.extend(vertices)
        web_gl_data.normals.extend(normals)

        return web_gl_data

    def __calculate_3_points_mesh(self, l_b_point: Coordinate3D, r_b_point: Coordinate3D, u_point: Coordinate3D,
                                  is_it_positive_normal: bool) \
            -> tuple[list[float], list[float]]:
        vertices = []
        normals = []
        vertices.extend([l_b_point.x, l_b_point.y, l_b_point.z])
        vertices.extend([u_point.x, u_point.y, u_point.z])
        vertices.extend([r_b_point.x, r_b_point.y, r_b_point.z])

        first_vector_1 = Coordinate3D(x=(l_b_point.x - r_b_point.x), y=(l_b_point.y - r_b_point.y),
                                      z=(l_b_point.z - r_b_point.z))
        second_vector_1 = Coordinate3D(x=(r_b_point.x - u_point.x), y=(r_b_point.y - u_point.y),
                                       z=(r_b_point.z - u_point.z))
        normal_1 = self.__get_normal_vector(first_vector_1, second_vector_1)
        if is_it_positive_normal:
            if normal_1.z < 0:
                normal_1.invert()
        else:
            if normal_1.z > 0:
                normal_1.invert()
        normals.extend(normal_1.to_list() * 3)

        return vertices, normals

    def __create_two_diameters_mesh(self, down: list[Coordinate3D], up: list[Coordinate3D],
                                    is_it_positive_normal: bool) -> WebGLData:
        web_gl_data = WebGLData([], normals=[])
        for i in range(0, len(down) - 1):
            down_points = down[0 + i: 2 + i]
            up_points = up[0 + i:2 + i]
            l_b_point = down_points[0]
            l_u_point = up_points[0]
            r_b_point = down_points[1]
            r_u_point = up_points[1]

            vertices, normals = self.__calculate_4_points_mesh(l_b_point, l_u_point, r_b_point, r_u_point,
                                                               is_it_positive_normal)

            web_gl_data.vertices.extend(vertices)
            web_gl_data.normals.extend(normals)

        l_b_point = down[0]
        l_u_point = up[0]
        r_b_point = down[-1]
        r_u_point = up[-1]

        vertices, normals = self.__calculate_4_points_mesh(l_b_point, l_u_point, r_b_point, r_u_point,
                                                           is_it_positive_normal)

        web_gl_data.vertices.extend(vertices)
        web_gl_data.normals.extend(normals)

        return web_gl_data

    def __calculate_4_points_mesh(self, l_b_point: Coordinate3D, l_u_point: Coordinate3D, r_b_point: Coordinate3D,
                                  r_u_point: Coordinate3D, is_it_positive_normal: bool) \
            -> tuple[list[float], list[float]]:
        vertices = []
        normals = []
        vertices.extend([l_b_point.x, l_b_point.y, l_b_point.z])
        vertices.extend([l_u_point.x, l_u_point.y, l_u_point.z])
        vertices.extend([r_u_point.x, r_u_point.y, r_u_point.z])

        first_vector_1 = Coordinate3D(x=(l_b_point.x - l_u_point.x), y=(l_b_point.y - l_u_point.y),
                                      z=(l_b_point.z - l_u_point.z))
        second_vector_1 = Coordinate3D(x=(r_u_point.x - l_u_point.x), y=(r_u_point.y - l_u_point.y),
                                       z=(r_u_point.z - l_u_point.z))
        normal_1 = self.__get_normal_vector(first_vector_1, second_vector_1)

        if is_it_positive_normal:
            if normal_1.z < 0:
                normal_1.invert()
        else:
            if normal_1.z > 0:
                normal_1.invert()

        normals.extend(normal_1.to_list() * 3)

        vertices.extend([r_u_point.x, r_u_point.y, r_u_point.z])
        vertices.extend([r_b_point.x, r_b_point.y, r_b_point.z])
        vertices.extend([l_b_point.x, l_b_point.y, l_b_point.z])

        first_vector_2 = Coordinate3D(x=(l_u_point.x - r_u_point.x), y=(l_u_point.y - r_u_point.y),
                                      z=(l_u_point.z - r_u_point.z))
        second_vector_2 = Coordinate3D(x=(r_u_point.x - r_b_point.x), y=(r_u_point.y - r_b_point.y),
                                       z=(r_u_point.z - r_b_point.z))
        normal_2 = self.__get_normal_vector(first_vector_2, second_vector_2)
        if is_it_positive_normal:
            if normal_2.z < 0:
                normal_2.invert()
        else:
            if normal_2.z > 0:
                normal_2.invert()

        normals.extend(normal_2.to_list() * 3)

        return vertices, normals

    def __calculate_circle(self, radius: float, count: int, z_0: float,
                           x: float, y: float, z: float) -> list[Coordinate3D]:
        points_1 = self.__calculate_1_or_3_square_points(radius, x, y, int(count / 4), z_0 + z)
        points_2 = self.__calculate_2_or_4_square_points(radius, x, y, int(count / 4), z_0 + z, is_it_4=False)
        points_3 = self.__calculate_1_or_3_square_points(radius, x, y, int(count / 4), z_0 + z, is_it_1=False)
        points_4 = self.__calculate_2_or_4_square_points(radius, x, y, int(count / 4), z_0 + z)
        return points_1 + points_2 + points_3 + points_4

    def __calculate_1_or_3_square_points(self, radius: float, x: float, y: float,
                                         count: int, z_0: float, is_it_1=True) -> list[Coordinate3D]:
        step = 90 / count
        counter = 1
        angle = step
        points = []
        while counter != count:
            k = math.tan(math.radians(angle))
            x_0 = math.sqrt(radius ** 2 / (1 + k ** 2))
            if not is_it_1:
                x_0 = -x_0
            y_0 = k * x_0
            points.append(Coordinate3D(x_0 + x, y_0 + y, z_0))
            counter += 1
            angle += step
        if is_it_1:
            points.append(Coordinate3D(0 + x, radius + y, z_0))
        else:
            points.append(Coordinate3D(0 + x, -radius + y, z_0))
        return points

    def __calculate_2_or_4_square_points(self, radius: float, x: float, y: float, count: int,
                                         z_by_zero: float, is_it_4=True) -> list[Coordinate3D]:
        step = 90 / count
        counter = 1
        angle = 90 + step
        points = []
        while counter != count:
            k = math.tan(math.radians(angle))
            x_by_zero = math.sqrt(radius ** 2 / (1 + k ** 2))
            if not is_it_4:
                x_by_zero = -x_by_zero
            y_by_zero = k * x_by_zero
            points.append(Coordinate3D(x_by_zero + x, y_by_zero + y, z_by_zero))
            counter += 1
            angle += step

        if is_it_4:
            points.append(Coordinate3D(radius + x, 0 + y, z_by_zero))
        else:
            points.append(Coordinate3D(-radius + x, 0 + y, z_by_zero))

        return points

    def __get_normal_vector(self, first_vector: Coordinate3D, second_vector: Coordinate3D):
        x = first_vector.y * second_vector.z - first_vector.z * second_vector.y
        y = first_vector.z * second_vector.x - first_vector.x * second_vector.z
        z = first_vector.x * second_vector.y - first_vector.y * second_vector.x
        x, y, z = self.__normalize(x, y, z)
        return Coordinate3D(x=x, y=y, z=z)

    def __normalize(self, x: float, y: float, z: float) -> tuple[int | float, int | float, int | float]:
        delimiter = abs(max(abs(x), abs(y), abs(z)))
        if delimiter == 0:
            delimiter = 1
        x = x / delimiter
        y = y / delimiter
        z = z / delimiter
        if x == 0:
            x = int(x)
        if y == 0:
            y = int(y)
        if z == 0:
            z = int(z)
        return x, y, z


if __name__ == '__main__':
    SphereCreator().create_sphere(1)

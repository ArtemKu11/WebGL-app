import math
from .dto import Coordinate3D, Face4Point


class TrapezoidCreator:
    # Вид сверху:
    #         2 грань
    # x_2_left  x2   x_2_right
    #        --------
    #        |      |
    #        |      |
    # 3 гр.  |      |  4 грань
    #        |      |
    #        |      |
    #        --------
    # x_1_left  x1   x_1_right
    #         1 грань
    #
    # 5 грань - низ, 6 грань - верх
    # 6 грань не всегда параллельна 5-ой. Отсюда можно получить объемную трапецию
    def create_trapezoid(self, x1: float, y1: float, x2: float, y2: float, z: float, first_height: float,
                         second_height: float, width: float):
        if first_height + z <= z or second_height + z <= z:
            print('Измеренная высота ниже высоты слоя, меш не считаю')
            return []
        if x2 - x1 == 0:
            first_face, second_face = self.__calculate_1_and_2_face_const_x(x1, y1, x2, y2, z, first_height,
                                                                            second_height,
                                                                            width)

        elif y2 - y1 == 0:
            first_face, second_face = self.__calculate_1_and_2_face_const_y(x1, y1, x2, y2, z, first_height,
                                                                            second_height,
                                                                            width)
        else:
            # Направляющая прямая
            k = (y2 - y1) / (x2 - x1)
            # b = y1 - k * x1
            # Перпендикулярная прямая через x1, y1:
            k1 = -1 / k
            # b1 = y1 - k * x1
            b1 = (x1 / k) + y1
            b2 = (x2 / k) + y2

            first_face, second_face = self.__calculate_1_and_2_face(k1, b1, b2, x1, y1, x2, y2, z, first_height,
                                                                    second_height,
                                                                    width)

        third_face, fourth_face = self.__calculate_3_and_4_face(first_face, second_face)
        third_face = third_face.to_web_gl_data()
        fourth_face = fourth_face.to_web_gl_data()

        fifth_face = self.__calculate_5_face(first_face, second_face).to_web_gl_data()
        sixth_face = self.__calculate_6_face(first_face, second_face)

        sixth_face = sixth_face.to_web_gl_data()
        first_face = first_face.to_web_gl_data()
        second_face = second_face.to_web_gl_data()

        return first_face + second_face + third_face + fourth_face + fifth_face + sixth_face

    def __calculate_1_and_2_face_const_y(self, x1: float, y1: float,
                                         x2: float, y2: float, z: float, first_height: float, second_height: float,
                                         width: float) -> tuple[Face4Point, Face4Point]:
        # Первая грань
        x_zero_1_right = 0  # Первая точка первой грани относительно нуля
        x_zero_1_left = 0  # Вторая точка первой грани относительно нуля
        x_1_right = x_zero_1_right + x1
        x_1_left = x_zero_1_left + x1
        y_1_right = y1 - width / 2
        y_1_left = y1 + width / 2

        # Нормаль:
        # Первой грани:
        x_n_1 = x1 - x2
        y_n_1 = y1 - y2
        z_n_1 = 0
        if x_n_1 > 1:
            x_n_1 = x_n_1 / x_n_1
            y_n_1 = y_n_1 / x_n_1
        if y_n_1 > 1:
            x_n_1 = x_n_1 / y_n_1
            y_n_1 = y_n_1 / y_n_1

        first_face_height = z + first_height
        first_face = self.__create_face_4_point(x_1_right, y_1_right, z,
                                                x_1_left, y_1_left, z,
                                                x_1_right, y_1_right, first_face_height,
                                                x_1_left, y_1_left, first_face_height,
                                                x_n_1, y_n_1, z_n_1)

        # Вторая грань
        x_2_left = x2
        x_2_right = x2
        y_2_left = y2 - width / 2
        y_2_right = y2 + width / 2

        # Нормаль:
        # Второй грани:
        x_n_2 = - x_n_1
        y_n_2 = - y_n_1
        z_n_2 = 0

        second_face_height = z + second_height
        second_face = self.__create_face_4_point(x_2_right, y_2_right, z,
                                                 x_2_left, y_2_left, z,
                                                 x_2_right, y_2_right, second_face_height,
                                                 x_2_left, y_2_left, second_face_height,
                                                 x_n_2, y_n_2, z_n_2)
        return first_face, second_face

    def __calculate_1_and_2_face_const_x(self, x1: float, y1: float,
                                         x2: float, y2: float, z: float, first_height: float, second_height: float,
                                         width: float) -> tuple[Face4Point, Face4Point]:
        # Первая грань
        x_zero_1_right = width / 2  # Первая точка первой грани относительно нуля
        x_zero_1_left = -width / 2  # Вторая точка первой грани относительно нуля
        x_1_right = x_zero_1_right + x1
        x_1_left = x_zero_1_left + x1
        y_1_right = y1
        y_1_left = y1

        # Нормаль:
        # Первой грани:
        x_n_1 = x1 - x2
        y_n_1 = y1 - y2
        z_n_1 = 0
        if x_n_1 > 1:
            x_n_1 = x_n_1 / x_n_1
            y_n_1 = y_n_1 / x_n_1
        if y_n_1 > 1:
            x_n_1 = x_n_1 / y_n_1
            y_n_1 = y_n_1 / y_n_1

        first_face_height = z + first_height
        first_face = self.__create_face_4_point(x_1_right, y_1_right, z,
                                                x_1_left, y_1_left, z,
                                                x_1_right, y_1_right, first_face_height,
                                                x_1_left, y_1_left, first_face_height,
                                                x_n_1, y_n_1, z_n_1)

        # Вторая грань
        x_2_left = x2 + x_zero_1_right
        x_2_right = x2 + x_zero_1_left
        y_2_left = y2
        y_2_right = y2

        # Нормаль:
        # Второй грани:
        x_n_2 = - x_n_1
        y_n_2 = - y_n_1
        z_n_2 = 0

        second_face_height = z + second_height
        second_face = self.__create_face_4_point(x_2_right, y_2_right, z,
                                                 x_2_left, y_2_left, z,
                                                 x_2_right, y_2_right, second_face_height,
                                                 x_2_left, y_2_left, second_face_height,
                                                 x_n_2, y_n_2, z_n_2)
        return first_face, second_face

    def __calculate_6_face(self, first_face: Face4Point, second_face: Face4Point) -> Face4Point:
        # Шестая грань, нормаль в лицо, низ - первая грань
        x_l_b = first_face.left_up_point.x
        y_l_b = first_face.left_up_point.y
        z_l_b = first_face.left_up_point.z
        x_r_b = first_face.right_up_point.x
        y_r_b = first_face.right_up_point.y
        z_r_b = first_face.right_up_point.z
        x_l_u = second_face.right_up_point.x
        y_l_u = second_face.right_up_point.y
        z_l_u = second_face.right_up_point.z
        x_r_u = second_face.left_up_point.x
        y_r_u = second_face.left_up_point.y
        z_r_u = second_face.left_up_point.z

        first_vector = Coordinate3D(x=x_r_b - x_r_u, y=y_r_b - y_r_u, z=z_r_b - z_r_u)
        second_vector = Coordinate3D(x=x_l_u - x_r_u, y=y_l_u - y_r_u, z=z_l_u - z_r_u)
        normal = self.__get_normal_vector(first_vector, second_vector)
        if normal.z < 0:
            normal.invert()

        right_bottom_point = Coordinate3D(x_r_b, y_r_b, z_r_b)
        left_bottom_point = Coordinate3D(x_l_b, y_l_b, z_l_b)
        right_up_point = Coordinate3D(x_r_u, y_r_u, z_r_u)
        left_up_point = Coordinate3D(x_l_u, y_l_u, z_l_u)
        return Face4Point(right_bottom_point=right_bottom_point, left_bottom_point=left_bottom_point,
                          right_up_point=right_up_point, left_up_point=left_up_point,
                          normal=normal)

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

    def __get_normal_vector(self, first_vector: Coordinate3D, second_vector: Coordinate3D):
        x = first_vector.y * second_vector.z - first_vector.z * second_vector.y
        y = first_vector.z * second_vector.x - first_vector.x * second_vector.z
        z = first_vector.x * second_vector.y - first_vector.y * second_vector.x
        x, y, z = self.__normalize(x, y, z)
        return Coordinate3D(x=x, y=y, z=z)

    def __calculate_5_face(self, first_face: Face4Point, second_face: Face4Point) -> Face4Point:
        # Пятая грань, нормаль в лицо, низ - первая грань
        x_l_b = first_face.right_bottom_point.x
        y_l_b = first_face.right_bottom_point.y
        z_l_b = first_face.right_bottom_point.z
        x_r_b = first_face.left_bottom_point.x
        y_r_b = first_face.left_bottom_point.y
        z_r_b = first_face.left_bottom_point.z
        x_l_u = second_face.left_bottom_point.x
        y_l_u = second_face.left_bottom_point.y
        z_l_u = second_face.left_bottom_point.z
        x_r_u = second_face.right_bottom_point.x
        y_r_u = second_face.right_bottom_point.y
        z_r_u = second_face.right_bottom_point.z
        x_n = 0
        y_n = 0
        z_n = -1
        right_bottom_point = Coordinate3D(x_r_b, y_r_b, z_r_b)
        left_bottom_point = Coordinate3D(x_l_b, y_l_b, z_l_b)
        right_up_point = Coordinate3D(x_r_u, y_r_u, z_r_u)
        left_up_point = Coordinate3D(x_l_u, y_l_u, z_l_u)
        normal = Coordinate3D(x_n, y_n, z_n)
        return Face4Point(right_bottom_point=right_bottom_point, left_bottom_point=left_bottom_point,
                          right_up_point=right_up_point, left_up_point=left_up_point,
                          normal=normal)

    def __calculate_3_and_4_face(self, first_face: Face4Point, second_face: Face4Point) -> \
            tuple[Face4Point, Face4Point]:
        # Третья грань
        x_3_right = first_face.left_bottom_point.x
        y_3_right = first_face.left_bottom_point.y
        x_3_left = second_face.right_bottom_point.x
        y_3_left = second_face.right_bottom_point.y

        # Нормаль:
        # Третьей грани:
        x_n_3 = x_3_right - first_face.right_bottom_point.x
        y_n_3 = y_3_right - first_face.right_bottom_point.y
        z_n_3 = 0
        x_n_3, y_n_3, z_n_3 = self.__normalize(x_n_3, y_n_3, z_n_3)

        third_face_right_height = first_face.left_up_point.z
        third_face_left_height = second_face.right_up_point.z
        third_face_z = first_face.left_bottom_point.z

        third_face = self.__create_face_4_point(x_3_right, y_3_right, third_face_z,
                                                x_3_left, y_3_left, third_face_z,
                                                x_3_right, y_3_right, third_face_right_height,
                                                x_3_left, y_3_left, third_face_left_height,
                                                x_n_3, y_n_3, z_n_3)

        # Четвертая грань
        x_4_right = second_face.left_bottom_point.x
        y_4_right = second_face.left_bottom_point.y
        x_4_left = first_face.right_bottom_point.x
        y_4_left = first_face.right_bottom_point.y

        # Нормаль
        # Четвертой грани:
        x_n_4 = - x_n_3
        y_n_4 = - y_n_3
        z_n_4 = 0

        fourth_face_right_height = second_face.left_up_point.z
        fourth_face_left_height = first_face.right_up_point.z
        fourth_face_z = first_face.right_bottom_point.z

        fourth_face = self.__create_face_4_point(x_4_right, y_4_right, fourth_face_z,
                                                 x_4_left, y_4_left, fourth_face_z,
                                                 x_4_right, y_4_right, fourth_face_right_height,
                                                 x_4_left, y_4_left, fourth_face_left_height,
                                                 x_n_4, y_n_4, z_n_4)

        return third_face, fourth_face

    def __calculate_1_and_2_face(self, perpendicular_line_k: float, perpendicular_line_b_1: float,
                                 perpendicular_line_b_2: float,
                                 x1: float, y1: float,
                                 x2: float, y2: float, z: float, first_height: float, second_height: float,
                                 width: float) -> tuple[Face4Point, Face4Point]:
        # Первая грань
        x_zero_1_right = math.sqrt(
            ((width / 2) ** 2) / (1 + perpendicular_line_k ** 2))  # Первая точка первой грани относительно нуля
        x_zero_1_left = -x_zero_1_right  # Вторая точка первой грани относительно нуля
        x_1_right = x_zero_1_right + x1
        x_1_left = x_zero_1_left + x1
        y_1_right = (perpendicular_line_k * x_1_right) + perpendicular_line_b_1
        y_1_left = (perpendicular_line_k * x_1_left) + perpendicular_line_b_1

        # Нормаль:
        # Первой грани:
        x_n_1 = x1 - x2
        y_n_1 = y1 - y2
        z_n_1 = 0
        if x_n_1 > 1:
            x_n_1 = x_n_1 / x_n_1
            y_n_1 = y_n_1 / x_n_1
        if y_n_1 > 1:
            x_n_1 = x_n_1 / y_n_1
            y_n_1 = y_n_1 / y_n_1

        first_face_height = z + first_height
        first_face = self.__create_face_4_point(x_1_right, y_1_right, z,
                                                x_1_left, y_1_left, z,
                                                x_1_right, y_1_right, first_face_height,
                                                x_1_left, y_1_left, first_face_height,
                                                x_n_1, y_n_1, z_n_1)

        # Вторая грань
        x_2_left = x2 + x_zero_1_right
        x_2_right = x2 + x_zero_1_left
        y_2_left = (perpendicular_line_k * x_2_left) + perpendicular_line_b_2
        y_2_right = (perpendicular_line_k * x_2_right) + perpendicular_line_b_2

        # Нормаль:
        # Второй грани:
        x_n_2 = - x_n_1
        y_n_2 = - y_n_1
        z_n_2 = 0

        second_face_height = z + second_height
        second_face = self.__create_face_4_point(x_2_right, y_2_right, z,
                                                 x_2_left, y_2_left, z,
                                                 x_2_right, y_2_right, second_face_height,
                                                 x_2_left, y_2_left, second_face_height,
                                                 x_n_2, y_n_2, z_n_2)
        return first_face, second_face

    def __create_face_4_point(self, x_r_b: float, y_r_b: float, z_r_b,
                              x_l_b: float, y_l_b: float, z_l_b,
                              x_r_u: float, y_r_u: float, z_r_u,
                              x_l_u: float, y_l_u: float, z_l_u,
                              x_n: float, y_n: float, z_n: float):
        right_bottom_point = Coordinate3D(x_r_b, y_r_b, z_r_b)
        left_bottom_point = Coordinate3D(x_l_b, y_l_b, z_l_b)
        right_up_point = Coordinate3D(x_r_u, y_r_u, z_r_u)
        left_up_point = Coordinate3D(x_l_u, y_l_u, z_l_u)
        normal = Coordinate3D(x_n, y_n, z_n)
        return Face4Point(right_bottom_point=right_bottom_point, left_bottom_point=left_bottom_point,
                          right_up_point=right_up_point, left_up_point=left_up_point,
                          normal=normal)

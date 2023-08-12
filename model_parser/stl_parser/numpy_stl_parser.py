from stl import mesh
# from parser_stl import WebGLData
from dto import WebGLData


def parse_stl_file(path: str) -> WebGLData:
    result = mesh.Mesh.from_file(path)
    result_shape = result.points.shape
    required_shape = result_shape[0] * result_shape[1]
    vertices = list(result.points.reshape(required_shape))
    vertices = list(map(float, vertices))
    result = list(result.normals)
    normals = []
    for arr in result:
        normal = list(arr)
        normal = list(map(float, normal))
        for i in range(0, 3):
            normals.extend(normal)
    web_gl_data = WebGLData(vertices=vertices, normals=normals)
    # web_gl_data.vertices = vertices
    # web_gl_data.normals = normals
    return web_gl_data

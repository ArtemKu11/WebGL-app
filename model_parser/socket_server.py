import asyncio
import json
import queue
import websockets
from websockets.exceptions import ConnectionClosedOK

from dto import WebGLData
from socket_modules import SocketServerResponse
from mesh_creator import MeshCreator


class WebSocketServer:
    loop: asyncio.AbstractEventLoop
    notifications_queue: queue.Queue[SocketServerResponse]

    def __init__(self, loop):
        self.loop = loop
        self.clients_list = []
        self.notifications_queue = queue.Queue()

    async def start_server(self):
        print('[ INFO ] ЗАПУЩЕН СОКЕТ')
        serve_func = websockets.serve(self.new_client_connected, "localhost", 8125)

        # gpio_processor = GornControllerGPIO(self.send_to_clients, self.clients_list, self.loop, self.events_queue)
        await asyncio.gather(serve_func, self.__listen_notifications())

    async def __listen_notifications(self):
        while True:
            if not self.clients_list:
                await asyncio.sleep(1)
                continue
            while not self.notifications_queue.empty():
                response = self.notifications_queue.get(block=True)
                await self.send_to_clients(response)
            await asyncio.sleep(0.01)

    async def send_to_clients(self, socket_response: SocketServerResponse):
        # print(result)
        if len(self.clients_list):
            for i in range(0, len(self.clients_list)):
                response = json.dumps(socket_response.to_json_dict())
                await self.clients_list[i].send(response)

    async def create_layer(self, z: float):
        # web_gl_data = WebGLData([])
        x = 0
        y = 0
        layer_diameter = 100
        web_gl_data = WebGLData([])
        for i in range(0, layer_diameter):
            web_gl_data = MeshCreator().create_sphere(2, x, y, z)
            self.push_to_current_object(web_gl_data)
            x += 0.5
            # await asyncio.sleep(0.05)
        await asyncio.sleep(0.5)
        # self.push_to_current_object(web_gl_data)
        # await asyncio.sleep(5)
        for i in range(0, layer_diameter):
            web_gl_data = MeshCreator().create_sphere(2, x, y, z)
            self.push_to_current_object(web_gl_data)
            y += 0.5
            # await asyncio.sleep(0.05)
        await asyncio.sleep(0.5)
        for i in range(0, layer_diameter):
            web_gl_data = MeshCreator().create_sphere(2, x, y, z)
            self.push_to_current_object(web_gl_data)
            x -= 0.5
            # await asyncio.sleep(0.05)
        await asyncio.sleep(0.5)
        for i in range(0, layer_diameter):
            web_gl_data = MeshCreator().create_sphere(2, x, y, z)
            self.push_to_current_object(web_gl_data)
            y -= 0.5
            # await asyncio.sleep(0.05)
        await asyncio.sleep(0.5)
        return web_gl_data

    def push_to_current_object(self, web_gl_data: WebGLData):
        self.notifications_queue.put(
            SocketServerResponse(method='notify_web_gl_push_to_current_object', params=web_gl_data.to_json_dict()),
            block=True)

    async def create_sphere(self):
        self.notifications_queue.put(
            SocketServerResponse(method='notify_web_gl_init_to_new_object'),
            block=True)

        # web_gl_data = WebGLData([])
        for i in range(0, 100):
            print('Слой', i)
            await self.create_layer(i)
        # web_gl_data = MeshCreator().create_sphere(2)
        # self.notifications_queue.put(
        #     SocketServerResponse(method='notify_web_gl_data_changed', params=web_gl_data.to_json_dict()), block=True)

    async def create_square(self):
        web_gl_data = MeshCreator().create_trapezoid(x1=0, y1=-5, x2=-5, y2=0, z=-1, first_height=2, second_height=2,
                                                     width=2)
        web_gl_data += MeshCreator().create_trapezoid(x1=-5, y1=0, x2=0, y2=5, z=-1, first_height=2, second_height=2,
                                                      width=2)
        web_gl_data += MeshCreator().create_trapezoid(x1=0, y1=5, x2=5, y2=0, z=-1, first_height=2, second_height=2,
                                                      width=2)
        web_gl_data += MeshCreator().create_trapezoid(x1=5, y1=0, x2=0, y2=-5, z=-1, first_height=2, second_height=2,
                                                      width=2)
        self.notifications_queue.put(
            SocketServerResponse(method='notify_web_gl_data_changed', params=web_gl_data.to_json_dict()), block=True)

    async def new_client_connected(self, client_socket, path):
        print('[ INFO ] НОВЫЙ КЛИЕНТ')
        if self.clients_list.count(client_socket):
            return
        self.clients_list.append(client_socket)
        # await self.create_square()
        await self.create_sphere()
        while True:
            try:
                message = await client_socket.recv()
                print(message)
                parsed_message = json.loads(message)
                response = SocketServerResponse(params=parsed_message, method='notify_web_gl_data_changed')
                self.notifications_queue.put(response, block=True)
                print(parsed_message)
            except ConnectionClosedOK:
                if self.clients_list.count(client_socket):
                    self.clients_list.remove(client_socket)
                    print('[ INFO ] КЛИЕНТ ОТКЛЮЧЕН')
                break

    def stop_everything(self):
        for task in asyncio.all_tasks(self.loop):
            task.cancel()


if __name__ == '__main__':
    event_loop = asyncio.new_event_loop()
    server = WebSocketServer(event_loop)
    asyncio.set_event_loop(event_loop)
    try:
        event_loop.run_until_complete(server.start_server())
    except KeyboardInterrupt:
        server.stop_everything()

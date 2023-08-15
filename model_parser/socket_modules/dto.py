from dataclasses import dataclass


@dataclass
class SocketServerResponse:
    result: dict | str | list = None
    jsonrpc: str = '2.0'
    params: dict | str | list = None
    method: str = None

    def to_json_dict(self) -> dict:
        return {
            "jsonrpc": self.jsonrpc,
            "result": self.result,
            "params": self.params,
            "method": self.method
        }

import { Store } from "vuex"
import { SocketClient } from "./socketClient"
import { RootState } from "@/store/types"

export class SocketActions {
    private socketClient: SocketClient
    constructor(store: Store<RootState>) {
        this.socketClient = this.createSocket(store)
    }

    private createSocket(store: Store<RootState>): SocketClient {
        console.log('Попытка создать сокет')
        const socketClient = new SocketClient(store)
        socketClient.connect()
        return socketClient
    }

    emit() {
        this.socketClient.emit()
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { toCamelCase } from "@/helpers/toCamelCase"
import { RootState } from "@/store/types"
import { Store } from "vuex"

export interface SocketRequest {
    jsonrpc: string;
    id: number;
    method: string;
    params?: any;
}

interface SocketError {
    code: number;
    message: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SocketResponse { // response.data
    jsonrpc: string; // always available
    method?: string; // generic responses
    params?: [any, number?]; // generic responses
    id?: number; // specific response
    result?: any; // specific response
    error?: string | SocketError; // specific response
}

export class SocketClient {
    connection: WebSocket | null = null
    // url = 'ws://192.168.1.113:8125'
    url = 'ws://localhost:8125'
    reconnectingTimeout = 1000
    debug = false
    stateTimeout: number | null = null
    store: Store<RootState>

    constructor(store: Store<RootState>) {
        this.store = store
    }

    connect() {
        this.connection = new WebSocket(this.url)

        this.connection.onopen = () => {
            console.log('Socket open')
            this.store.commit('socket/setSocketConnected', true)
        }

        this.connection.onclose = (e) => {
            if (this.debug) { console.log('СОКЕТ ЗАКРЫТ ', e) }
            this.store.commit('socket/setSocketConnected', false)
            setTimeout(this.connect.bind(this), this.reconnectingTimeout)
        }

        this.connection.onerror = (e) => {
            if (this.debug) { console.log('ОШИБКА СОКЕТА ', e) }
        }

        this.connection.onmessage = (m) => {
            const response = m as any
            if (response.data) {
                const socketResponse = JSON.parse(response.data) as SocketResponse
                if (socketResponse.method) {
                    if (socketResponse.method.startsWith('notify')) {
                        this.store.dispatch('socket/' + toCamelCase(socketResponse.method), socketResponse.params)
                    }
                }
                console.log(socketResponse)
            }
        }
    }

    emit() {
        if (this.connection?.readyState === WebSocket.OPEN) {
            const getRandomNumber = (min: number, max: number) => {
                return Math.floor(Math.random() * (max - min + 1)) + min
            }
            const id = getRandomNumber(10000, 99999)
            const packet: SocketRequest = {
                id,
                method: 'test_method',
                jsonrpc: '2.0'
            }
            this.connection.send(JSON.stringify(packet))
            console.log('Отправлен пакет')
        } else {
            console.log('Ошибка отправки. Сокет не открыт')
        }
    }
}

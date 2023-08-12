import { SocketState } from "./types"

export const defaultState = (): SocketState => {
    return {
        isSocketConnected: false
    }
}

export const state = defaultState()

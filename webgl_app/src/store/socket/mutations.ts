import { MutationTree } from "vuex"
import { SocketState } from "./types"

export const mutations: MutationTree<SocketState> = {
    setSocketConnected(state, payload: boolean) {
        state.isSocketConnected = payload
    }
}

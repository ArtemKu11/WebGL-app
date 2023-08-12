import { RootState } from "@/store/types"
import { GetterTree } from "vuex"
import { SocketState } from "./types"

export const getters: GetterTree<SocketState, RootState> = {
    getSocketConnected(state) {
        return state.isSocketConnected
    }
}

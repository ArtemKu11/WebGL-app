import { GetterTree } from "vuex"
import { WebGLState } from "./types"
import { RootState } from "../types"

export const getters: GetterTree<WebGLState, RootState> = {
    getWebGLData(state) {
        return state.webGLData
    }
}

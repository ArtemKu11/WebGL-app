import { MutationTree } from "vuex"
import { WebGLState } from "./types"

export const mutations: MutationTree<WebGLState> = {
    setRenderNewObject(state, payload) {
        state.renderNewObject = payload
    },

    setPushToCurrentObject(state, payload) {
        state.pushToCurrentObject = payload
    },

    setInitToNewObject(state, payload) {
        state.initToNewObject = payload
    }
}

import { ActionTree } from "vuex"
import { SocketState } from "./types"
import { RootState } from "../types"
import { WebGLData } from "@/components/canvas/obj_parser"

export const actions: ActionTree<SocketState, RootState> = {
    notifyWebGlDataChanged({ dispatch }, payload: WebGLData) {
        // console.log(payload)
        dispatch('webgl/setWebGLData', payload, { root: true })
    },

    notifyWebGlRenderNewObject({ dispatch }, payload: WebGLData) {
        dispatch('webgl/setWebGLData', payload, { root: true })
        dispatch('webgl/renderNewObject', null, { root: true })
    },

    notifyWebGlPushToCurrentObject({ dispatch }, payload: WebGLData) {
        dispatch('webgl/pushToWebGLData', payload, { root: true })
        dispatch('webgl/pushToCurrentObject', null, { root: true })
    },

    notifyWebGlInitToNewObject({ dispatch }) {
        dispatch('webgl/initToNewObject', null, { root: true })
    }
}

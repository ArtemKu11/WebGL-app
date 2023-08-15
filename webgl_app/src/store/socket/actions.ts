import { ActionTree } from "vuex"
import { SocketState } from "./types"
import { RootState } from "../types"
import { WebGLData } from "@/components/canvas/obj_parser"

export const actions: ActionTree<SocketState, RootState> = {
    notifyWebGlDataChanged({ dispatch }, payload: WebGLData) {
        // console.log(payload)
        dispatch('webgl/setWebGLData', payload, { root: true })
    }
}

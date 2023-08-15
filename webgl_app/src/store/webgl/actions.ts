import { WebGLData } from "@/components/canvas/obj_parser"
import { ActionTree } from "vuex"
import { RootState } from "../types"
import { WebGLState } from "./types"

export const actions: ActionTree<WebGLState, RootState> = {
    setWebGLData({ state }, payload: WebGLData) {
        if (!payload.vertices) {
            payload.vertices = []
        }
        if (!payload.textures) {
            payload.textures = []
        }
        if (!payload.normals) {
            payload.normals = []
        }
        state.webGLData = payload
    },

    pushToWebGLData({ state }, payload: WebGLData) {
        if (payload.vertices) {
            state.webGLData.vertices.push(...payload.vertices)
        }
        if (payload.textures) {
            if (state.webGLData.textures) {
                state.webGLData.textures.push(...payload.textures)
            } else {
                state.webGLData.textures = payload.textures
            }
        }
        if (payload.normals) {
            if (state.webGLData.normals) {
                state.webGLData.normals.push(...payload.normals)
            } else {
                state.webGLData.normals = payload.normals
            }
        }
    }
}

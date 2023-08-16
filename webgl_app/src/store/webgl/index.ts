import { Module } from "vuex"
import { RootState } from "../types"
import { actions } from "./actions"
import { getters } from "./getters"
import { state } from "./state"
import { WebGLState } from "./types"
import { mutations } from "./mutations"

const namespaced = true
export const webgl: Module<WebGLState, RootState> = {
    namespaced,
    state,
    actions,
    getters,
    mutations
}

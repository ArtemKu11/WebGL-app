import { Module } from "vuex"
import { RootState } from "../types"
import { state } from "./state"
import { WaitsState } from "./types"
import { getters } from "./getters"
import { mutations } from "./mutations"

const namespaced = true
export const waits: Module<WaitsState, RootState> = {
    namespaced,
    state,
    mutations,
    getters
}

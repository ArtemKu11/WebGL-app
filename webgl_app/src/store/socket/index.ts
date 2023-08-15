import { RootState } from "@/store/types"
import { Module } from "vuex"
import { state } from "./state"
import { SocketState } from "./types"
import { mutations } from "./mutations"
import { getters } from "./getters"
import { actions } from "./actions"

const namespaced = true

export const socket: Module<SocketState, RootState> = {
    namespaced,
    state,
    mutations,
    getters,
    actions
}

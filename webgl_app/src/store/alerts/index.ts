import { Module } from "vuex"
import { AlertState } from "./types"
import { RootState } from "@/store/types"
import { state } from "./state"
import { actions } from "./actions"
import { getters } from "./getters"

const namespaced = true
export const alerts: Module<AlertState, RootState> = {
    namespaced,
    state,
    actions,
    getters
}

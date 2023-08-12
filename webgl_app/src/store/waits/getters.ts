import { GetterTree } from "vuex"
import { WaitsState } from "./types"
import { RootState } from "../types"

export const getters: GetterTree<WaitsState, RootState> = {
    hasWaits(state) {
        return state.waits.length
    },

    getWaits(state) {
        return state.waits
    }
}

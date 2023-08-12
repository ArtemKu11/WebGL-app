import { MutationTree } from "vuex"
import { WaitsState } from "./types"

export const mutations: MutationTree<WaitsState> = {
    addWait(state, payload: string) {
        state.waits.push(payload)
    },

    removeWait(state, payload: string) {
        const index = state.waits.indexOf(payload)
        if (index !== -1) {
            state.waits.splice(index, 1)
        }
    }
}

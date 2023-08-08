import { GetterTree } from "vuex"
import { AlertState } from "./types"
import { RootState } from "@/store/types"

export const getters: GetterTree<AlertState, RootState> = {
    getAlertQueue(state) {
        return state.alertQueue
    },

    getAlertFlag: (state) => () => {
        return Boolean(state.alertQueue.length)
    },

    getFirstAlert: (state) => () => {
        return state.alertQueue[0]
    },

    getInfoAlertCancellationToken: (state) => () => {
        return state.infoAlertState.cancellationToken
    },

    getInfoAlert: (state) => () => {
        return state.infoAlertState.currentMessage
    },

    getInfoAlertFlag: (state) => () => {
        return Boolean(state.infoAlertState.currentMessage)
    }
}

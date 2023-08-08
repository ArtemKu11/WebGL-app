import { ActionTree } from "vuex"
import { AlertState, AlertType, InfoAlertType } from "./types"
import { RootState } from "@/store/types"

export const actions: ActionTree<AlertState, RootState> = {
    addToAlertQueue({ state }, payload: AlertType) {
        state.alertQueue.push(payload)
    },

    confirmClick({ state }) {
        const alert = state.alertQueue[0]
        if (alert) {
            if (alert.confirmCallback) {
                alert.confirmCallback()
            }
        }
        state.alertQueue.shift()
    },

    rejectClick({ state }) {
        const alert = state.alertQueue[0]
        if (alert) {
            if (alert.rejectCallback) {
                alert.rejectCallback()
            }
        }
        state.alertQueue.shift()
    },

    showInfoAlert({ state, dispatch }, payload: InfoAlertType) {
        if (state.infoAlertState.currentMessage) {
            state.infoAlertState.cancellationToken = true
            setTimeout(() => {
                dispatch('showInfoAlert', payload)
            }, 10)
            return
        }
        state.infoAlertState.cancellationToken = false
        state.infoAlertState.currentMessage = payload
    },

    onSocketError({ dispatch }, payload) {
        const messageObj = payload.message
        let alert: InfoAlertType
        if (messageObj) {
            const messageText = messageObj.message
            if (messageText) {
                alert = {
                    message: messageText,
                    type: 'red'
                }
            } else {
                alert = {
                    message: messageObj,
                    type: 'red'
                }
            }
        } else {
            alert = {
                message: payload,
                type: 'red'
            }
        }
        const htmlText = alert.message.split('\\n').join('<br>')
        alert.message = htmlText
        dispatch('showInfoAlert', alert)
    }
}

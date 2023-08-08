import { AlertState } from "./types"

export const defaultState = (): AlertState => {
    return {
        alertQueue: [],
        infoAlertState: {
            cancellationToken: false,
            currentMessage: null
        }
    }
}

export const state = defaultState()

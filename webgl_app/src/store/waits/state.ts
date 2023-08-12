import { WaitsState } from "./types"

export const defaultState = (): WaitsState => {
    return {
        waits: []
    }
}

export const state = defaultState()

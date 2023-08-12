import { AlertState } from "./alerts/types"
import { WaitsState } from "./waits/types"

export interface RootState {
    alerts: AlertState
    waits: WaitsState
}

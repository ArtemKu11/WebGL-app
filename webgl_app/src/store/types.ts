import { AlertState } from "./alerts/types"
import { SocketState } from "./socket/types"
import { WaitsState } from "./waits/types"

export interface RootState {
    alerts: AlertState
    waits: WaitsState,
    socket: SocketState
}

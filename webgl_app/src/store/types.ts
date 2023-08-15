import { AlertState } from "./alerts/types"
import { SocketState } from "./socket/types"
import { WaitsState } from "./waits/types"
import { WebGLState } from "./webgl/types"

export interface RootState {
    alerts: AlertState
    waits: WaitsState,
    socket: SocketState
    webgl: WebGLState
}

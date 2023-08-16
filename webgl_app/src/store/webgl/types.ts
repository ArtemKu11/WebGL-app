import { WebGLData } from "@/components/canvas/obj_parser"
type RenderNewObjectFunction = () => void
type PushToCurrentObjectFunction = () => void
type InitToNewObjectFunction = () => void

export interface WebGLState {
    webGLData: WebGLData
    renderNewObject: RenderNewObjectFunction | null
    pushToCurrentObject: PushToCurrentObjectFunction | null
    initToNewObject: InitToNewObjectFunction | null
}

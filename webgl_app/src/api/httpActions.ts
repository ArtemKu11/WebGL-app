import { RootState } from "@/store/types"
import { Store } from "vuex"
import { httpClient } from "./axiosHttpClient"
import { PARSING_OBJECT_WAIT } from "@/waits"
import { WebGLData } from "@/components/canvas/obj_parser"

export class HttpActions {
    private store: Store<RootState>

    constructor(store: Store<RootState>) {
        this.store = store
    }

    async parseObject(file: Blob): Promise<WebGLData | null> {
        const formData = new FormData()
        formData.append('file', file)

        this.store.commit('waits/addWait', PARSING_OBJECT_WAIT)
        const result = await httpClient.post('/parse_stl', formData)
        this.store.commit('waits/removeWait', PARSING_OBJECT_WAIT)

        if (result && result.data) {
            if (result.data.logs) {
                this.printLogs(result.data.logs)
            }
            if (result.data.web_gl_data) {
                const parsedObject = result.data.web_gl_data as WebGLData
                if (parsedObject.vertices && parsedObject.normals) {
                    return parsedObject
                }
            }
        }
        return null
    }

    private printLogs(logs: string[]) {
        logs.forEach((item) => console.log(item))
    }
}

import { WebGLState } from "./types"

export const defaultState = (): WebGLState => {
    return {
        webGLData: {
            vertices: [],
            normals: [],
            textures: []
        }
    }
}

export const state = defaultState()

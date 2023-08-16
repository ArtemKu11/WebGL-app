import { WebGLState } from "./types"

export const defaultState = (): WebGLState => {
    return {
        webGLData: {
            vertices: [],
            normals: [],
            textures: []
        },
        renderNewObject: null,
        pushToCurrentObject: null,
        initToNewObject: null
    }
}

export const state = defaultState()

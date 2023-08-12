/* eslint-disable indent */
// import { shaderFs, shaderVs } from "./shaders"

import { cameraProgramFragmentalShader, cameraProgramVertexShader, easyShaderFs, easyShaderVs, fragmentalFunctionalShader, lightningFragmentalShader, lightningVertexShader, textureProgramFragmentalShader, textureProgramVertexShader, varFragmentalShader, varVertexShader, vertexShaderForPixels } from "./shaders"
import { m3 } from './m3'
import { m4 } from './m4'

interface LightningProgramBuffers {
    positionBuffer: WebGLBuffer | null
    normalBuffer: WebGLBuffer | null
}

interface LightningProgramDataAttributes {
    positionLocation: number
    normalLocation: number
}

interface LightningProgramDataUniforms {
    worldViewProjectionLocation: WebGLUniformLocation | null
    worldInverseTransposeLocation: WebGLUniformLocation | null
    colorLocation: WebGLUniformLocation | null
    reverseLightDirectionLocation: WebGLUniformLocation | null
    reverseLightDirectionLocationTwo: WebGLUniformLocation | null
    reverseLightDirectionLocationThree: WebGLUniformLocation | null
    reverseLightDirectionLocationFour: WebGLUniformLocation | null

}

interface LightningProgramDataCamera {
    fieldOfViewRadians: number
    objectAngleYRadians: number
    objectAngleXRadians: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastCameraMatrix: any // Матрица из m4
    cameraXTranslation: number
    cameraYTranslation: number
    cameraZTranslation: number
    bindYAxisToObject: boolean
}

interface LightningProgramData {
    program: WebGLProgram | null
    attributes: LightningProgramDataAttributes
    uniforms: LightningProgramDataUniforms
    buffers: LightningProgramBuffers
    camera: LightningProgramDataCamera
}

interface CameraProgramData {
    program: WebGLProgram | null
    positionLocation: number
    positionBuffer: WebGLBuffer | null
    colorLocation: number
    colorBuffer: WebGLBuffer | null
    fieldOfViewRadians: number
    objectAngleYRadians: number
    objectAngleXRadians: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastCameraMatrix: any // Матрица из m4
    cameraXTranslation: number
    cameraYTranslation: number
    cameraZTranslation: number
    matrixLocation: WebGLUniformLocation | null
    bindYAxisToObject: boolean
}

export class LearningCanvasHandler {
    gl!: WebGL2RenderingContext
    canvasElement: HTMLCanvasElement
    cameraProgramData: CameraProgramData | null = null
    lightningProgramData: LightningProgramData | null = null

    // Примитивный алгоритм:
    // 0. initWebGL()
    // 1. Скомпилировать фрагментарный и вершинный шейдер
    // 2. Создать программу для этих шейдеров
    // 3. Получить нужные аттрибуты и униформы
    // 4. Создать буфер для данных (Можно и после 7 шага, установкой правил записи в аттрибуты данных)
    // 5. Очистить канвас
    // 6. this.gl.useProgram(program)
    // 7. Включить аттрибуты
    // 8. Установить, по каким правилам записывать в аттрибуты данные
    // 9. Установить униформу разрешения экрана (Для 0, 0 - верхний левый угол)
    // 10. Записать значения в буфер
    // 11. Отренедерить сцену

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement
        const context = this.initWebGL()
        if (context) {
            this.gl = context
            // this.runClipSpaceProgram()
            // this.runPixelProgram()
            // this.runFunctionalProgram()
            // this.runFragmentalLearningProgram()
            // this.runSimplyCameraProgram()
            // this.runTextureProgram()
            this.runLightningProgram()
        }
    }

    runLightningProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, lightningVertexShader())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, lightningFragmentalShader())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                // look up where the vertex data needs to go.
                const positionLocation = this.gl.getAttribLocation(program, "a_position")
                const normalLocation = this.gl.getAttribLocation(program, "a_normal")

                // lookup uniforms
                const worldViewProjectionLocation = this.gl.getUniformLocation(program, "u_worldViewProjection")
                const worldInverseTransposeLocation = this.gl.getUniformLocation(program, "u_worldInverseTranspose")
                const colorLocation = this.gl.getUniformLocation(program, "u_color")
                const reverseLightDirectionLocation = this.gl.getUniformLocation(program, "u_reverseLightDirection")
                const reverseLightDirectionLocationTwo = this.gl.getUniformLocation(program, "u_reverseLightDirectionTwo")
                const reverseLightDirectionLocationThree = this.gl.getUniformLocation(program, "u_reverseLightDirectionThree")
                const reverseLightDirectionLocationFour = this.gl.getUniformLocation(program, "u_reverseLightDirectionFour")

                const positionBuffer = this.gl.createBuffer()
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
                this.putGeometryInBuffer()

                const normalBuffer = this.gl.createBuffer()
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
                this.putNormalsInBuffer()

                this.createLightningProgramData(program, positionLocation, normalLocation, worldViewProjectionLocation, worldInverseTransposeLocation,
                    reverseLightDirectionLocation, colorLocation, positionBuffer, normalBuffer, reverseLightDirectionLocationTwo,
                    reverseLightDirectionLocationThree, reverseLightDirectionLocationFour)
                this.drawLightningProgramScene()
            }
        }
    }

    drawLightningProgramScene() {
        if (this.lightningProgramData) {
            this.clearCanvasAndEnable3DFeatures()
            this.gl.useProgram(this.lightningProgramData.program)

            this.enableAndSpecifyPositionAttribute(this.lightningProgramData.attributes.positionLocation, this.lightningProgramData.buffers.positionBuffer)
            this.enableAndSpecifyNormalAttribute(this.lightningProgramData.attributes.normalLocation, this.lightningProgramData.buffers.normalBuffer)

            // Compute the projection matrix
            const aspect = this.canvasElement.clientWidth / this.canvasElement.clientHeight
            const zNear = 1
            const zFar = 5000
            const projectionMatrix = m4.perspective(this.lightningProgramData.camera.fieldOfViewRadians, aspect, zNear, zFar)

            // Если надо убрать перспективу перемещения
            const xDivider = projectionMatrix[0]
            const yDivider = projectionMatrix[5]
            let xTranslation = this.lightningProgramData.camera.cameraXTranslation
            let yTranslation = this.lightningProgramData.camera.cameraYTranslation
            const zTranslation = this.lightningProgramData.camera.cameraZTranslation
            if (zTranslation > 100) {
                const width = this.canvasElement.clientWidth
                const height = this.canvasElement.clientHeight
                const requiredXFraction = xTranslation / (width / 2)
                const requiredYFraction = yTranslation / (height / 2)
                xTranslation = zTranslation * requiredXFraction / xDivider
                yTranslation = zTranslation * requiredYFraction / yDivider
            }

            // Compute a matrix for the camera
            let cameraMatrix
            if (this.lightningProgramData.camera.bindYAxisToObject) {
                cameraMatrix = m4.yRotation(this.lightningProgramData.camera.objectAngleYRadians)
                cameraMatrix = m4.xRotate(cameraMatrix, this.lightningProgramData.camera.objectAngleXRadians)
            } else {
                cameraMatrix = this.lightningProgramData.camera.lastCameraMatrix
                cameraMatrix = m4.yRotate(cameraMatrix, this.lightningProgramData.camera.objectAngleYRadians)
                cameraMatrix = m4.xRotate(cameraMatrix, this.lightningProgramData.camera.objectAngleXRadians)
                this.lightningProgramData.camera.lastCameraMatrix = cameraMatrix
                this.lightningProgramData.camera.objectAngleXRadians = 0
                this.lightningProgramData.camera.objectAngleYRadians = 0
            }

            // Если надо сместить камеру относительно оси ее вращения (объект будет вращаться так же, просто камера будет смотреть не логично)
            // cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 3)
            // cameraMatrix = m4.translate(cameraMatrix, -this.cameraProgramData.xTranslation, -this.cameraProgramData.yTranslation, this.cameraProgramData.zTranslation)
            cameraMatrix = m4.translate(cameraMatrix, -xTranslation, -yTranslation, this.lightningProgramData.camera.cameraZTranslation)

            const viewMatrix = m4.inverse(cameraMatrix)
            const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

            const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, m4.identity())
            const worldInverseMatrix = m4.inverse(viewMatrix)
            const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix)
            this.gl.uniformMatrix4fv(this.lightningProgramData.uniforms.worldViewProjectionLocation, false, worldViewProjectionMatrix)
            this.gl.uniformMatrix4fv(this.lightningProgramData.uniforms.worldInverseTransposeLocation, false, worldInverseTransposeMatrix)
            this.gl.uniform4fv(this.lightningProgramData.uniforms.colorLocation, [0.62, 0.62, 0.62, 1])
            this.gl.uniform3fv(this.lightningProgramData.uniforms.reverseLightDirectionLocation, m4.normalize([0.5, 0.5, 1]))
            this.gl.uniform3fv(this.lightningProgramData.uniforms.reverseLightDirectionLocationTwo, m4.normalize([-0.5, 0.5, 1]))
            this.gl.uniform3fv(this.lightningProgramData.uniforms.reverseLightDirectionLocationThree, m4.normalize([0.5, -0.5, 1]))
            this.gl.uniform3fv(this.lightningProgramData.uniforms.reverseLightDirectionLocationFour, m4.normalize([-0.5, -0.5, 1]))

            const primitiveType = this.gl.TRIANGLES
            const offset = 0
            const count = 16 * 6
            this.gl.drawArrays(primitiveType, offset, count)
        }
    }

    enableAndSpecifyNormalAttribute(normalLocation: number, normalBuffer: WebGLBuffer | null) {
        // Turn on the position attribute
        this.gl.enableVertexAttribArray(normalLocation)

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3 // 3 components per iteration
        const type = this.gl.FLOAT // the data is 32bit floats
        const normalize = false // don't normalize the data
        const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0 // start at the beginning of the buffer

        this.gl.vertexAttribPointer(
            normalLocation, size, type, normalize, stride, offset)
    }

    createLightningProgramData(program: WebGLProgram, positionLocation: number, normalLocation: number,
        worldViewProjectionLocation: WebGLUniformLocation | null, worldInverseTransposeLocation: WebGLUniformLocation | null,
        reverseLightDirectionLocation: WebGLUniformLocation | null, colorLocation: WebGLUniformLocation | null,
        positionBuffer: WebGLBuffer | null, normalBuffer: WebGLBuffer | null, reverseLightDirectionLocationTwo: WebGLUniformLocation | null,
        reverseLightDirectionLocationThree: WebGLUniformLocation | null, reverseLightDirectionLocationFour: WebGLUniformLocation | null) {
        this.lightningProgramData = {
            program,
            attributes: {
                positionLocation,
                normalLocation
            },
            uniforms: {
                worldViewProjectionLocation,
                worldInverseTransposeLocation,
                reverseLightDirectionLocation,
                colorLocation,
                reverseLightDirectionLocationTwo,
                reverseLightDirectionLocationThree,
                reverseLightDirectionLocationFour
            },
            buffers: {
                positionBuffer,
                normalBuffer
            },
            camera: {
                bindYAxisToObject: false,
                cameraXTranslation: 0,
                cameraYTranslation: 0,
                cameraZTranslation: 400,
                fieldOfViewRadians: this.degToRad(60),
                lastCameraMatrix: m4.identity(),
                objectAngleXRadians: 0,
                objectAngleYRadians: 0
            }
        }
    }

    putNormalsInBuffer() {
        const normals = new Float32Array([
            // left column front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // top rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // middle rung front
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // left column back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // top rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // middle rung back
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // top rung right
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // under top rung
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // between top rung and middle
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // top of middle rung
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // right of middle rung
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // bottom of middle rung.
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // right of bottom
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            // left side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0])
        this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW)
    }

    runTextureProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, textureProgramVertexShader())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, textureProgramFragmentalShader())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                const positionLocation = this.gl.getAttribLocation(program, "a_position")
                const texcoordLocation = this.gl.getAttribLocation(program, "a_texcoord")
                const matrixLocation = this.gl.getUniformLocation(program, "u_matrix")
                const textureLocation = this.gl.getUniformLocation(program, "u_texture")

                // const textureBuffer = this.gl.createBuffer()

                const positionBuffer = this.gl.createBuffer()
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
                this.putGeometryInBuffer()

                // const colorBuffer = this.gl.createBuffer()
                // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
                // this.putColorsInBuffer()

                const texcoordBuffer = this.gl.createBuffer()
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer)
                this.gl.enableVertexAttribArray(texcoordLocation)
                this.gl.vertexAttribPointer(texcoordLocation, 2, this.gl.FLOAT, false, 0, 0)
                this.putTextureDataInBuffer() // Координаты текстуры от 0 до 1
                const fieldOfViewRadians = this.degToRad(60)

                // Create a texture.
                const texture = this.gl.createTexture()
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
                // Fill the texture with a 1x1 blue pixel.
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
                    new Uint8Array([0, 0, 255, 255]))
                // Asynchronously load an image
                const image = new Image()
                image.src = require("@/assets/f-texture.png")
                image.addEventListener('load', () => {
                    // Now that the image has loaded make copy it to the texture.
                    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
                    this.gl.generateMipmap(this.gl.TEXTURE_2D)
                    this.drawTextureScene(program, positionLocation, positionBuffer, texcoordLocation, texcoordBuffer, fieldOfViewRadians, matrixLocation, textureLocation)
                })

                // const cameraAngleYRadians = this.degToRad(0)
                // const cameraAngleXRadians = this.degToRad(0)
            }
        }
    }

    drawTextureScene(program: WebGLProgram, positionLocation: number, positionBuffer: WebGLBuffer | null, texcoordLocation: number,
        texcoordBuffer: WebGLBuffer | null, fieldOfViewRadians: number, matrixLocation: WebGLUniformLocation | null,
        textureLocation: WebGLUniformLocation | null) {
        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

        this.gl.enable(this.gl.CULL_FACE)
        this.gl.enable(this.gl.DEPTH_TEST)

        // Clear the canvas AND the depth buffer.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(program)

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(positionLocation)

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3 // 3 components per iteration
        const type = this.gl.FLOAT // the data is 32bit floats
        const normalize = false // don't normalize the data
        const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0 // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset)

        // Turn on the texcoord attribute
        this.gl.enableVertexAttribArray(texcoordLocation)

        // bind the texcoord buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer)

        // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        const sizeTex = 2 // 2 components per iteration
        const typeTex = this.gl.FLOAT // the data is 32bit floats
        const normalizeTex = false // don't normalize the data
        const strideTex = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offsetTex = 0 // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            texcoordLocation, sizeTex, typeTex, normalizeTex, strideTex, offsetTex)

        // Compute the projection matrix
        const aspect = this.canvasElement.clientWidth / this.canvasElement.clientHeight
        const projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000)

        const cameraPosition = [0, 0, 200]
        const up = [0, 1, 0]
        const target = [0, 0, 0]

        // Compute the camera's matrix using look at.
        const cameraMatrix = m4.lookAt(cameraPosition, target, up)

        // Make a view matrix from the camera matrix.
        const viewMatrix = m4.inverse(cameraMatrix)

        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

        // const matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians)
        // matrix = m4.yRotate(matrix, modelYRotationRadians)

        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrix)

        // Tell the shader to use texture unit 0 for u_texture
        this.gl.uniform1i(textureLocation, 0)

        // Draw the geometry.
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 16 * 6)
    }

    putTextureDataInBuffer() {
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([
                // left column front
                38 / 255, 44 / 255,
                38 / 255, 223 / 255,
                113 / 255, 44 / 255,
                38 / 255, 223 / 255,
                113 / 255, 223 / 255,
                113 / 255, 44 / 255,

                // top rung front
                113 / 255, 44 / 255,
                113 / 255, 85 / 255,
                218 / 255, 44 / 255,
                113 / 255, 85 / 255,
                218 / 255, 85 / 255,
                218 / 255, 44 / 255,

                // middle rung front
                113 / 255, 112 / 255,
                113 / 255, 151 / 255,
                203 / 255, 112 / 255,
                113 / 255, 151 / 255,
                203 / 255, 151 / 255,
                203 / 255, 112 / 255,

                // left column back
                0, 0,
                1, 0,
                0, 1,
                0, 1,
                1, 0,
                1, 1,

                // top rung back
                0, 0,
                1, 0,
                0, 1,
                0, 1,
                1, 0,
                1, 1,

                // middle rung back
                0, 0,
                1, 0,
                0, 1,
                0, 1,
                1, 0,
                1, 1,

                // top
                0, 0,
                1, 0,
                1, 1,
                0, 0,
                1, 1,
                0, 1,

                // top rung right
                0, 0,
                1, 0,
                1, 1,
                0, 0,
                1, 1,
                0, 1,

                // under top rung
                0, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 1,
                1, 0,

                // between top rung and middle
                0, 0,
                1, 1,
                0, 1,
                0, 0,
                1, 0,
                1, 1,

                // top of middle rung
                0, 0,
                1, 1,
                0, 1,
                0, 0,
                1, 0,
                1, 1,

                // right of middle rung
                0, 0,
                1, 1,
                0, 1,
                0, 0,
                1, 0,
                1, 1,

                // bottom of middle rung.
                0, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 1,
                1, 0,

                // right of bottom
                0, 0,
                1, 1,
                0, 1,
                0, 0,
                1, 0,
                1, 1,

                // bottom
                0, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 1,
                1, 0,

                // left side
                0, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 1,
                1, 0]),
            this.gl.STATIC_DRAW)
    }

    runSimplyCameraProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, cameraProgramVertexShader())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, cameraProgramFragmentalShader())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                const positionLocation = this.gl.getAttribLocation(program, "a_position")
                const colorLocation = this.gl.getAttribLocation(program, "a_color")
                const matrixLocation = this.gl.getUniformLocation(program, "u_matrix")

                const positionBuffer = this.gl.createBuffer()
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
                this.putGeometryInBuffer()

                const colorBuffer = this.gl.createBuffer()
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)
                this.putColorsInBuffer()

                const cameraAngleYRadians = this.degToRad(0)
                const cameraAngleXRadians = this.degToRad(0)
                const fieldOfViewRadians = this.degToRad(60)
                this.createCameraProgramData(program, positionLocation, positionBuffer, colorLocation, colorBuffer, fieldOfViewRadians, cameraAngleYRadians, cameraAngleXRadians, matrixLocation)
                this.drawSimpleCameraProgramScene()
                // this.drawLookAtCameraProgramScene()
            }
        }
    }

    toDefault() {
        if (this.cameraProgramData) {
            this.cameraProgramData.objectAngleXRadians = 0
            this.cameraProgramData.objectAngleYRadians = 0
            this.cameraProgramData.lastCameraMatrix = m4.identity()
            this.cameraProgramData.cameraXTranslation = 0
            this.cameraProgramData.cameraYTranslation = 0
            this.cameraProgramData.cameraZTranslation = 600
            this.drawSimpleCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.objectAngleXRadians = 0
            this.lightningProgramData.camera.objectAngleYRadians = 0
            this.lightningProgramData.camera.lastCameraMatrix = m4.identity()
            this.lightningProgramData.camera.cameraXTranslation = 0
            this.lightningProgramData.camera.cameraYTranslation = 0
            this.lightningProgramData.camera.cameraZTranslation = 600
            this.drawLightningProgramScene()
        }
    }

    createCameraProgramData(program: WebGLProgram | null, positionLocation: number, positionBuffer: WebGLBuffer | null, colorLocation: number, colorBuffer: WebGLBuffer | null,
        fieldOfViewRadians: number, cameraAngleYRadians: number, cameraAngleXRadians: number, matrixLocation: WebGLUniformLocation | null) {
        this.cameraProgramData = {
            program,
            positionLocation,
            positionBuffer,
            colorLocation,
            colorBuffer,
            fieldOfViewRadians,
            objectAngleYRadians: cameraAngleYRadians,
            objectAngleXRadians: cameraAngleXRadians,
            lastCameraMatrix: m4.identity(),
            cameraXTranslation: 0,
            cameraYTranslation: 0,
            cameraZTranslation: 600,
            matrixLocation,
            bindYAxisToObject: false
        }
    }

    moveCamera(xDistance: number, yDistance: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.cameraXTranslation += xDistance
            this.cameraProgramData.cameraYTranslation += yDistance
            this.drawSimpleCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.cameraXTranslation += xDistance
            this.lightningProgramData.camera.cameraYTranslation += yDistance
            this.drawLightningProgramScene()
        }
    }

    moveCameraByOneAxis(axis: string, distance: number) {
        if (this.cameraProgramData) {
            switch (axis.toLowerCase()) {
                case 'x':
                    this.cameraProgramData.cameraXTranslation += distance
                    break
                case 'y':
                    this.cameraProgramData.cameraYTranslation += distance
                    break
                case 'z':
                    if (this.cameraProgramData.cameraZTranslation + distance > -600) {
                        this.cameraProgramData.cameraZTranslation += distance
                    }
                    break
                default:
                    break
            }
            this.drawSimpleCameraProgramScene()
            // this.drawLookAtCameraProgramScene()
        }

        if (this.lightningProgramData) {
            switch (axis.toLowerCase()) {
                case 'x':
                    this.lightningProgramData.camera.cameraXTranslation += distance
                    break
                case 'y':
                    this.lightningProgramData.camera.cameraYTranslation += distance
                    break
                case 'z':
                    if (this.lightningProgramData.camera.cameraZTranslation + distance > -600) {
                        this.lightningProgramData.camera.cameraZTranslation += distance
                    }
                    break
                default:
                    break
            }
            this.drawLightningProgramScene()
        }
    }

    setCameraXTranslation(newTranslation: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.cameraXTranslation = newTranslation
            this.drawSimpleCameraProgramScene()
            // this.drawLookAtCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.cameraXTranslation = newTranslation
            this.drawLightningProgramScene()
        }
    }

    setCameraYTranslation(newTranslation: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.cameraYTranslation = newTranslation
            this.drawSimpleCameraProgramScene()
            // this.drawLookAtCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.cameraYTranslation = newTranslation
            this.drawLightningProgramScene()
        }
    }

    setCameraZTranslation(newTranslation: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.cameraZTranslation = newTranslation
            this.drawSimpleCameraProgramScene()
            // this.drawLookAtCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.cameraZTranslation = newTranslation
            this.drawLightningProgramScene()
        }
    }

    rotateObjectX(angleDiff: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.objectAngleXRadians += this.degToRad(angleDiff)
            this.drawSimpleCameraProgramScene()
            // this.drawLookAtCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.objectAngleXRadians += this.degToRad(angleDiff)
            this.drawLightningProgramScene()
        }
    }

    rotateObjectY(angleDiff: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.objectAngleYRadians += this.degToRad(angleDiff)
            this.drawSimpleCameraProgramScene()
            // this.drawLookAtCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.objectAngleYRadians += this.degToRad(angleDiff)
            this.drawLightningProgramScene()
        }
    }

    rotateObject(xAngle: number, yAngle: number) {
        if (this.cameraProgramData) {
            this.cameraProgramData.objectAngleXRadians += this.degToRad(xAngle)
            this.cameraProgramData.objectAngleYRadians += this.degToRad(yAngle)
            this.drawSimpleCameraProgramScene()
        } else if (this.lightningProgramData) {
            this.lightningProgramData.camera.objectAngleXRadians += this.degToRad(xAngle)
            this.lightningProgramData.camera.objectAngleYRadians += this.degToRad(yAngle)
            this.drawLightningProgramScene()
        }
    }

    refreshAngle(angle: number) {
        if (angle > 360) {
            return angle - Math.trunc(angle / 360)
        }
        if (angle < 0) {
            return 360 * (Math.abs(Math.trunc(angle / 360)) + 1) + angle
        }
        return angle
    }

    enableAndSpecifyPositionAttribute(positionLocation: number, positionBuffer: WebGLBuffer | null) { // attribute vec4 a_position;
        // Turn on the position attribute
        this.gl.enableVertexAttribArray(positionLocation)

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 3 // 3 components per iteration
        const type = this.gl.FLOAT // the data is 32bit floats
        const normalize = false // don't normalize the data
        const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0 // start at the beginning of the buffer

        this.gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset)
    }

    enableAndSpecifyColorAttribute(colorLocation: number, colorBuffer: WebGLBuffer | null) { // attribute vec4 a_color;
        // Turn on the color attribute
        this.gl.enableVertexAttribArray(colorLocation)

        // Bind the color buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer)

        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        const size = 3 // 3 components per iteration
        const type = this.gl.UNSIGNED_BYTE // the data is 8bit unsigned values
        const normalize = true // normalize the data (convert from 0-255 to 0-1)
        const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0 // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            colorLocation, size, type, normalize, stride, offset)
    }

    clearCanvasAndEnable3DFeatures() {
        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

        // Clear the canvas AND the depth buffer.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        // Turn on culling. By default backfacing triangles
        // will be culled.
        this.gl.enable(this.gl.CULL_FACE) // В принципе достаточно только this.gl.DEPTH_TEST

        // Enable the depth buffer
        this.gl.enable(this.gl.DEPTH_TEST)
    }

    drawLookAtCameraProgramScene() {
        if (this.cameraProgramData) {
            this.clearCanvasAndEnable3DFeatures()

            // Tell it to use our program (pair of shaders)
            this.gl.useProgram(this.cameraProgramData.program)

            this.enableAndSpecifyPositionAttribute(this.cameraProgramData.positionLocation, this.cameraProgramData.positionBuffer)
            this.enableAndSpecifyColorAttribute(this.cameraProgramData.colorLocation, this.cameraProgramData.colorBuffer)

            const numFs = 5
            const radius = 200

            // Compute the projection matrix
            const aspect = this.canvasElement.clientWidth / this.canvasElement.clientHeight
            const zNear = 1
            const zFar = 2000
            const projectionMatrix = m4.perspective(this.cameraProgramData.fieldOfViewRadians, aspect, zNear, zFar)

            // Compute the position of the first F
            const fPosition = [radius, 0, 0]

            // Use matrix math to compute a position on a circle where
            // the camera is
            let cameraMatrix = m4.yRotation(this.cameraProgramData.objectAngleYRadians)
            const cameraXMatrix = m4.xRotation(this.cameraProgramData.objectAngleXRadians)
            cameraMatrix = m4.multiply(cameraXMatrix, cameraMatrix)
            cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 3)

            // Get the camera's position from the matrix we computed
            const cameraPosition = [
                cameraMatrix[12],
                cameraMatrix[13],
                cameraMatrix[14]
            ]

            const up = [0, 1, 0]

            // Compute the camera's matrix using look at.
            cameraMatrix = m4.lookAt(cameraPosition, fPosition, up) // Если надо "смотреть" на что-то, траектория движения камеры при этом не меняется

            // Make a view matrix from the camera matrix
            const viewMatrix = m4.inverse(cameraMatrix)

            // Compute a view projection matrix
            const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

            for (let ii = 0; ii < numFs; ++ii) {
                const angle = ii * Math.PI * 2 / numFs
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                // starting with the view projection matrix
                // compute a matrix for the F
                const matrix = m4.translate(viewProjectionMatrix, x, 0, y)
                // matrix = m4.translate(matrix, radius, 0, 1) // Если надо сместить ось вращения от 0,0

                // Set the matrix.
                this.gl.uniformMatrix4fv(this.cameraProgramData.matrixLocation, false, matrix)

                // Draw the geometry.
                const primitiveType = this.gl.TRIANGLES
                const offset = 0
                const count = 16 * 6
                this.gl.drawArrays(primitiveType, offset, count)
            }
        }
    }

    drawSimpleCameraProgramScene() {
        if (this.cameraProgramData) {
            this.clearCanvasAndEnable3DFeatures()

            // Tell it to use our program (pair of shaders)
            this.gl.useProgram(this.cameraProgramData.program)

            this.enableAndSpecifyPositionAttribute(this.cameraProgramData.positionLocation, this.cameraProgramData.positionBuffer)
            this.enableAndSpecifyColorAttribute(this.cameraProgramData.colorLocation, this.cameraProgramData.colorBuffer)

            const numFs = 5
            const radius = 200

            // Compute the projection matrix
            const aspect = this.canvasElement.clientWidth / this.canvasElement.clientHeight
            const zNear = 1
            const zFar = 5000
            const projectionMatrix = m4.perspective(this.cameraProgramData.fieldOfViewRadians, aspect, zNear, zFar)

            // Если надо убрать перспективу перемещения
            const xDivider = projectionMatrix[0]
            const yDivider = projectionMatrix[5]
            let xTranslation = this.cameraProgramData.cameraXTranslation
            let yTranslation = this.cameraProgramData.cameraYTranslation
            const zTranslation = this.cameraProgramData.cameraZTranslation
            if (zTranslation > 100) {
                const width = this.canvasElement.clientWidth
                const height = this.canvasElement.clientHeight
                const requiredXFraction = xTranslation / (width / 2)
                const requiredYFraction = yTranslation / (height / 2)
                xTranslation = zTranslation * requiredXFraction / xDivider
                yTranslation = zTranslation * requiredYFraction / yDivider
            }

            // Compute a matrix for the camera
            let cameraMatrix
            if (this.cameraProgramData.bindYAxisToObject) {
                cameraMatrix = m4.yRotation(this.cameraProgramData.objectAngleYRadians)
                cameraMatrix = m4.xRotate(cameraMatrix, this.cameraProgramData.objectAngleXRadians)
            } else {
                cameraMatrix = this.cameraProgramData.lastCameraMatrix
                cameraMatrix = m4.yRotate(cameraMatrix, this.cameraProgramData.objectAngleYRadians)
                cameraMatrix = m4.xRotate(cameraMatrix, this.cameraProgramData.objectAngleXRadians)
                this.cameraProgramData.lastCameraMatrix = cameraMatrix
                this.cameraProgramData.objectAngleXRadians = 0
                this.cameraProgramData.objectAngleYRadians = 0
            }

            // Если надо сместить камеру относительно оси ее вращения (объект будет вращаться так же, просто камера будет смотреть не логично)
            // cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 3)
            // cameraMatrix = m4.translate(cameraMatrix, -this.cameraProgramData.xTranslation, -this.cameraProgramData.yTranslation, this.cameraProgramData.zTranslation)
            cameraMatrix = m4.translate(cameraMatrix, -xTranslation, -yTranslation, this.cameraProgramData.cameraZTranslation)

            // Make a view matrix from the camera matrix
            const viewMatrix = m4.inverse(cameraMatrix)

            // Compute a view projection matrix
            const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

            for (let ii = 0; ii < numFs; ++ii) {
                const angle = ii * Math.PI * 2 / numFs
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                // starting with the view projection matrix
                // compute a matrix for the F
                const matrix = m4.translate(viewProjectionMatrix, x, 0, y)
                // Если надо сместить камеру с осью вращения объекта (убедиться, что первый способ (относительно оси) закомментирован)
                // let matrix = m4.translate(viewProjectionMatrix, x, 0, y)
                // matrix = m4.translate(matrix, this.cameraProgramData.xTranslation, this.cameraProgramData.yTranslation, 1)
                // matrix = m4.xRotate(matrix, this.cameraProgramData.objectAngleXRadians)

                // Set the matrix.
                this.gl.uniformMatrix4fv(this.cameraProgramData.matrixLocation, false, matrix)

                // Draw the geometry.
                const primitiveType = this.gl.TRIANGLES
                const offset = 0
                const count = 16 * 6
                this.gl.drawArrays(primitiveType, offset, count)
            }
        }
    }

    putColorsInBuffer() {
        const colors = new Uint8Array([
            // left column front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // top rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // middle rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // left column back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // middle rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,

            // top rung right
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,

            // under top rung
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,

            // between top rung and middle
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,

            // top of middle rung
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,

            // right of middle rung
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,

            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,

            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,

            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,

            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220])
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW)
    }

    putGeometryInBuffer() {
        const positions = new Float32Array([
            // left column front
            0, 0, 0,
            0, 150, 0,
            30, 0, 0,
            0, 150, 0,
            30, 150, 0,
            30, 0, 0,

            // top rung front
            30, 0, 0,
            30, 30, 0,
            100, 0, 0,
            30, 30, 0,
            100, 30, 0,
            100, 0, 0,

            // middle rung front
            30, 60, 0,
            30, 90, 0,
            67, 60, 0,
            30, 90, 0,
            67, 90, 0,
            67, 60, 0,

            // left column back
            0, 0, 30,
            30, 0, 30,
            0, 150, 30,
            0, 150, 30,
            30, 0, 30,
            30, 150, 30,

            // top rung back
            30, 0, 30,
            100, 0, 30,
            30, 30, 30,
            30, 30, 30,
            100, 0, 30,
            100, 30, 30,

            // middle rung back
            30, 60, 30,
            67, 60, 30,
            30, 90, 30,
            30, 90, 30,
            67, 60, 30,
            67, 90, 30,

            // top
            0, 0, 0,
            100, 0, 0,
            100, 0, 30,
            0, 0, 0,
            100, 0, 30,
            0, 0, 30,

            // top rung right
            100, 0, 0,
            100, 30, 0,
            100, 30, 30,
            100, 0, 0,
            100, 30, 30,
            100, 0, 30,

            // under top rung
            30, 30, 0,
            30, 30, 30,
            100, 30, 30,
            30, 30, 0,
            100, 30, 30,
            100, 30, 0,

            // between top rung and middle
            30, 30, 0,
            30, 60, 30,
            30, 30, 30,
            30, 30, 0,
            30, 60, 0,
            30, 60, 30,

            // top of middle rung
            30, 60, 0,
            67, 60, 30,
            30, 60, 30,
            30, 60, 0,
            67, 60, 0,
            67, 60, 30,

            // right of middle rung
            67, 60, 0,
            67, 90, 30,
            67, 60, 30,
            67, 60, 0,
            67, 90, 0,
            67, 90, 30,

            // bottom of middle rung.
            30, 90, 0,
            30, 90, 30,
            67, 90, 30,
            30, 90, 0,
            67, 90, 30,
            67, 90, 0,

            // right of bottom
            30, 90, 0,
            30, 150, 30,
            30, 90, 30,
            30, 90, 0,
            30, 150, 0,
            30, 150, 30,

            // bottom
            0, 150, 0,
            0, 150, 30,
            30, 150, 30,
            0, 150, 0,
            30, 150, 30,
            30, 150, 0,

            // left side
            0, 0, 0,
            0, 0, 30,
            0, 150, 30,
            0, 0, 0,
            0, 150, 30,
            0, 150, 0])

        // Поворот на 90 градусов через x
        let matrix = m4.xRotation(Math.PI)
        matrix = m4.translate(matrix, -50, -75, -15)
        for (let ii = 0; ii < positions.length; ii += 3) {
            const vector = m4.vectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], matrix)
            positions[ii + 0] = vector[0]
            positions[ii + 1] = vector[1]
            positions[ii + 2] = vector[2]
        }

        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW)
    }

    radToDeg(r: number) {
        return r * 180 / Math.PI
    }

    degToRad(d: number) {
        return d * Math.PI / 180
    }

    runFragmentalLearningProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, varVertexShader())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, varFragmentalShader())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position")
                const matrixLocation = this.gl.getUniformLocation(program, "u_matrix")
                this.createAndBindBuffer()
                const positions = [ // Отсюда будут читаться значения в нужный аттрибут
                    0, 0,
                    0, 200,
                    200, 200
                ]
                this.writeInfoInBudder(positions) // Создать буфер и записать значения

                this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
                this.clearCanvas()
                this.gl.useProgram(program)
                this.gl.enableVertexAttribArray(positionAttributeLocation) // Включить аттрибут в шейдере
                this.specifyDataPullingOut(positionAttributeLocation) // Установить, по каким правилам записывать в него данные

                const translation = [150, 200] // В пикселях, смещение по x, y
                const angleInDegrees = 0 // Относительно первой точки по часовой (по умолчанию против)
                const scale = [1, 1] // В долях от единицы, масштаб по x, y в положительное направление
                this.computeMatrix(matrixLocation, translation, angleInDegrees, scale)

                this.renderScene(this.gl.TRIANGLES, 0, 3) // Записать в него данные
                // this.updateAngle(matrixLocation, 0)
                // this.updatePosition(matrixLocation, translation)
            }
        }
    }

    updatePosition(matrixLocation: WebGLUniformLocation | null, translation: number[]) {
        translation[0] += 2
        if (translation[0] > this.gl.canvas.width) {
            translation[0] = -200
        }
        const angleInRadians = 0
        const scale = [1, 1] // В долях от единицы, масштаб по x, y в положительное направление
        this.clearCanvas()
        this.computeMatrix(matrixLocation, translation, angleInRadians, scale)
        this.renderScene(this.gl.TRIANGLES, 0, 3)
        setTimeout(() => { this.updatePosition(matrixLocation, translation) }, 1)
    }

    updateAngle(matrixLocation: WebGLUniformLocation | null, angleInDegrees: number) {
        const translation = [250, 200]
        const scale = [1, 1]
        angleInDegrees += 1
        // angleInRadians = angleInDegrees * Math.PI / 180
        this.clearCanvas()
        this.computeMatrix(matrixLocation, translation, angleInDegrees, scale)
        this.renderScene(this.gl.TRIANGLES, 0, 3)
        setTimeout(() => { this.updateAngle(matrixLocation, angleInDegrees) }, 5)
    }

    // function updateScale(index) {
    //     return function (event, ui) {
    //         scale[index] = ui.value;
    //         drawScene();
    //     };
    // }

    computeMatrix(matrixLocation: WebGLUniformLocation | null, translation: number[], angleInDegrees: number, scale: number[]) {
        const angleInRadians = (360 - angleInDegrees) * Math.PI / 180
        let matrix = m3.projection(this.canvasElement.clientWidth, this.canvasElement.clientHeight)
        matrix = m3.translate(matrix, translation[0], translation[1])
        matrix = m3.rotate(matrix, angleInRadians)
        matrix = m3.scale(matrix, scale[0], scale[1])
        // Set the matrix.
        this.gl.uniformMatrix3fv(matrixLocation, false, matrix)
    }

    runFunctionalProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderForPixels())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentalFunctionalShader())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position") // vec4 / vec2 из которого беруться координаты точек
                const resolutionUniformLocation = this.gl.getUniformLocation(program, "u_resolution") // vec2 для фикса левого верхнего угла
                const colorUniformLocation = this.gl.getUniformLocation(program, "u_color") // vec4 - цвет
                this.clearCanvas()
                this.gl.useProgram(program)
                this.gl.enableVertexAttribArray(positionAttributeLocation) // Включить аттрибут в шейдере
                this.createAndBindBuffer()
                this.specifyDataPullingOut(positionAttributeLocation) // Установить, по каким правилам записывать в него данные
                this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height) // Установить разрешение канваса
                for (let i = 0; i < 50; i++) {
                    const positions = this.getRectanglePositions(this.randomInt(300), this.randomInt(300), this.randomInt(300), this.randomInt(300))
                    this.writeInfoInBudder(positions)
                    // Set a random color.
                    this.gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1)
                    this.renderScene(this.gl.TRIANGLES, 0, 6)
                }
            }
        }
    }

    getRectanglePositions(x: number, y: number, width: number, height: number) {
        const x1 = x
        const x2 = x + width
        const y1 = y
        const y2 = y + height
        return [
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]
    }

    randomInt(range: number) {
        return Math.floor(Math.random() * range)
    }

    runPixelProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderForPixels())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, easyShaderFs())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                const resolutionUniformLocation = this.gl.getUniformLocation(program, "u_resolution")
                const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position")
                const positions = [ // Отсюда будут читаться значения в нужный аттрибут
                    10, 20,
                    80, 20,
                    10, 30,
                    10, 30,
                    80, 20,
                    80, 30
                ]
                this.createAndBindBuffer()
                this.writeInfoInBudder(positions) // Создать буфер и записать значения
                // this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
                this.clearCanvas()
                this.gl.useProgram(program)
                this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height) // Установить разрешение канваса
                this.gl.enableVertexAttribArray(positionAttributeLocation) // Включить аттрибут в шейдере
                this.specifyDataPullingOut(positionAttributeLocation) // Установить, по каким правилам записывать в него данные
                this.renderScene(this.gl.TRIANGLES, 0, 6) // Записать в него данные
            }
        }
    }

    createAndBindBuffer() {
        const positionBuffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    }

    writeInfoInBudder(positions: number[]) {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW)
    }

    runClipSpaceProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, easyShaderVs())
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, easyShaderFs())
        if (vertexShader && fragmentShader) {
            const program = this.createProgram(vertexShader, fragmentShader)
            if (program) {
                const positionAttributeLocation = this.gl.getAttribLocation(program, "a_position")
                const positions = [ // Отсюда будут читаться значения в нужный аттрибут
                    -1, -1,
                    -1, 1,
                    1, 1
                ]
                this.createAndBindBuffer()
                this.writeInfoInBudder(positions) // Создать буфер и записать значения
                // this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
                this.clearCanvas()
                this.gl.useProgram(program)
                this.gl.enableVertexAttribArray(positionAttributeLocation) // Включить аттрибут в шейдере
                this.specifyDataPullingOut(positionAttributeLocation) // Установить, по каким правилам записывать в него данные
                this.renderScene(this.gl.TRIANGLES, 0, 3) // Записать в него данные
            }
        }
    }

    renderScene(renderType: number, offset: number, count: number) {
        // const renderType = this.gl.TRIANGLES // Будет рисовать треугольник по трем значениям из a_position
        // const offset = 0 // Смещение чтения из буфера
        // const count = 3 // Сколько раз выполнить шейдеры
        this.gl.drawArrays(renderType, offset, count)
    }

    specifyDataPullingOut(location: number) {
        const size = 2 // получить 2 компонента из буфера, остальные по умолчанию
        const type = this.gl.FLOAT // the data is 32bit floats
        const normalize = false // don't normalize the data
        const stride = 0 // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0 // start at the beginning of the buffer
        this.gl.vertexAttribPointer(location, size, type, normalize, stride, offset)

        // Значения vec4 по умолчанию - 0, 0, 0, 1
        // a_position = {x: 0, y: 0, z: 0, w: 1}
    }

    clearCanvas() {
        this.gl.clearColor(0, 0, 0, 0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    }

    createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = this.gl.createProgram()
        if (program) {
            this.gl.attachShader(program, vertexShader)
            this.gl.attachShader(program, fragmentShader)
            this.gl.linkProgram(program)
            const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)
            if (success) {
                return program
            } else {
                console.log(this.gl.getProgramInfoLog(program))
                this.gl.deleteProgram(program)
            }
        }
    }

    createShader(type: number, source: string) {
        const shader = this.gl.createShader(type)
        if (shader) {
            this.gl.shaderSource(shader, source)
            this.gl.compileShader(shader)
            const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)
            if (success) {
                return shader
            } else {
                console.log(this.gl.getShaderInfoLog(shader))
                this.gl.deleteShader(shader)
            }
        }
    }

    configureWebGLContext() {
        this.gl.clearColor(0.63, 0.63, 0.63, 1.0) // установить в качестве цвета очистки буфера цвета чёрный, полная непрозрачность
        this.gl.enable(this.gl.DEPTH_TEST) // включает использование буфера глубины
        this.gl.depthFunc(this.gl.LEQUAL) // определяет работу буфера глубины: более ближние объекты перекрывают дальние
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT) // очистить буфер цвета и буфер глубины.
    }

    initWebGL(): WebGL2RenderingContext | null {
        let gl = null

        try {
            // Попытаться получить стандартный контекст. Если не получится, попробовать получить экспериментальный.
            gl = this.canvasElement.getContext('webgl') as WebGL2RenderingContext || this.canvasElement.getContext('experimental-webgl') as WebGL2RenderingContext
        } catch (e) { }

        // Если мы не получили контекст GL, завершить работу
        if (!gl) {
            alert('Unable to initialize WebGL. Your browser may not support it.')
            gl = null
        }

        return gl
    }
}

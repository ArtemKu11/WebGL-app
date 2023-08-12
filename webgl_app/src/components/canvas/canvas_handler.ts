/* eslint-disable indent */
import { m4 } from "./m4"
import { WebGLData } from "./obj_parser"
import { lightningFragmentalShader, lightningVertexShader } from "./shaders"

interface ProgramBuffers {
    positionBuffer: WebGLBuffer | null
    normalBuffer: WebGLBuffer | null
}

interface ProgramAttributes {
    positionLocation: number
    normalLocation: number
}

interface ProgramUniforms {
    worldViewProjectionLocation: WebGLUniformLocation | null
    worldInverseTransposeLocation: WebGLUniformLocation | null
    colorLocation: WebGLUniformLocation | null
    reverseLightDirectionLocation: WebGLUniformLocation | null
    reverseLightDirectionLocationTwo: WebGLUniformLocation | null
    reverseLightDirectionLocationThree: WebGLUniformLocation | null
    reverseLightDirectionLocationFour: WebGLUniformLocation | null

}

interface ProgramCamera {
    fieldOfViewRadians: number
    objectAngleYRadians: number
    objectAngleXRadians: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastCameraMatrix: any // Матрица из m4
    cameraXTranslation: number
    cameraYTranslation: number
    cameraZTranslation: number
    bindYAxisToObject: boolean
    scaleFactor: number
}

interface ProgramData {
    program: WebGLProgram | null
    attributes: ProgramAttributes
    uniforms: ProgramUniforms
    buffers: ProgramBuffers
    camera: ProgramCamera
    vertexCount: number
}

export class CanvasHandler {
    private gl!: WebGL2RenderingContext
    private canvasElement: HTMLCanvasElement
    private programData: ProgramData | null = null

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvasElement = canvasElement
        const context = this.initWebGL()
        if (context) {
            this.gl = context
        }
    }

    renderObject(renderData: WebGLData, scaleFactor = 1) {
        if (renderData.vertices && renderData.normals) {
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
                    this.putDataInBuffer(renderData.vertices)

                    const normalBuffer = this.gl.createBuffer()
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer)
                    this.putDataInBuffer(renderData.normals)

                    const vertexCount = renderData.vertices.length

                    this.createProgramData(program, positionLocation, normalLocation, worldViewProjectionLocation, worldInverseTransposeLocation,
                        reverseLightDirectionLocation, colorLocation, positionBuffer, normalBuffer, reverseLightDirectionLocationTwo,
                        reverseLightDirectionLocationThree, reverseLightDirectionLocationFour, scaleFactor, vertexCount)
                    this.drawScene()
                }
            }
        }
    }

    bindYAxisToObject(bind: boolean) {
        if (this.programData) {
            this.programData.camera.bindYAxisToObject = bind
        }
    }

    toDefault() {
        if (this.programData) {
            this.programData.camera.objectAngleXRadians = 0
            this.programData.camera.objectAngleYRadians = 0
            this.programData.camera.lastCameraMatrix = m4.identity()
            this.programData.camera.cameraXTranslation = 0
            this.programData.camera.cameraYTranslation = 0
            this.programData.camera.cameraZTranslation = 4
            this.drawScene()
        }
    }

    setCameraXTranslation(newTranslation: number) {
        if (this.programData) {
            this.programData.camera.cameraXTranslation = newTranslation
            this.drawScene()
        }
    }

    setCameraYTranslation(newTranslation: number) {
        if (this.programData) {
            this.programData.camera.cameraYTranslation = newTranslation
            this.drawScene()
        }
    }

    setCameraZTranslation(newTranslation: number) {
        if (this.programData) {
            this.programData.camera.cameraZTranslation = newTranslation
            this.drawScene()
        }
    }

    rotateObjectX(angleDiff: number) {
        if (this.programData) {
            this.programData.camera.objectAngleXRadians += this.degToRad(angleDiff)
            this.drawScene()
        }
    }

    rotateObjectY(angleDiff: number) {
        if (this.programData) {
            this.programData.camera.objectAngleYRadians += this.degToRad(angleDiff)
            this.drawScene()
        }
    }

    rotateObject(xAngle: number, yAngle: number) {
        if (this.programData) {
            this.programData.camera.objectAngleXRadians += this.degToRad(xAngle)
            this.programData.camera.objectAngleYRadians += this.degToRad(yAngle)
            this.drawScene()
        }
    }

    moveCamera(xDistance: number, yDistance: number) {
        if (this.programData) {
            this.programData.camera.cameraXTranslation += xDistance
            this.programData.camera.cameraYTranslation += yDistance
            this.drawScene()
        }
    }

    moveCameraByOneAxis(axis: string, distance: number) {
        if (this.programData) {
            switch (axis.toLowerCase()) {
                case 'x':
                    this.programData.camera.cameraXTranslation += distance
                    break
                case 'y':
                    this.programData.camera.cameraYTranslation += distance
                    break
                case 'z':
                    // if (this.programData.camera.cameraZTranslation + distance > -600) {
                    this.programData.camera.cameraZTranslation += distance
                    // }
                    break
                default:
                    break
            }
            this.drawScene()
        }
    }

    zoomCameraByPercent(percent: number) {
        if (this.programData) {
            let currentPosition = this.programData.camera.cameraZTranslation
            if (currentPosition < 0.1 && percent < 0) {
                return
            }
            if (currentPosition === 0) {
                if (percent > 0) {
                    currentPosition = 0.1
                } else {
                    currentPosition = -0.1
                }
            }
            const requriedPosition = currentPosition + currentPosition * (percent / 100)
            this.programData.camera.cameraZTranslation = requriedPosition
            this.drawScene()
        }
    }

    private drawScene() {
        if (this.programData) {
            this.clearCanvasAndEnable3DFeatures()
            this.gl.useProgram(this.programData.program)

            this.enableAndSpecifyPositionAttribute(this.programData.attributes.positionLocation, this.programData.buffers.positionBuffer)
            this.enableAndSpecifyNormalAttribute(this.programData.attributes.normalLocation, this.programData.buffers.normalBuffer)

            // Compute the projection matrix
            const aspect = this.canvasElement.clientWidth / this.canvasElement.clientHeight
            const zNear = 1
            const zFar = 5000
            const projectionMatrix = m4.perspective(this.programData.camera.fieldOfViewRadians, aspect, zNear, zFar)

            // Если надо убрать перспективу перемещения
            const xDivider = projectionMatrix[0]
            const yDivider = projectionMatrix[5]
            let xTranslation = this.programData.camera.cameraXTranslation
            let yTranslation = this.programData.camera.cameraYTranslation
            const zTranslation = this.programData.camera.cameraZTranslation
            if (zTranslation > 0) {
                const width = this.canvasElement.clientWidth
                const height = this.canvasElement.clientHeight
                const requiredXFraction = xTranslation / (width / 2)
                const requiredYFraction = yTranslation / (height / 2)
                xTranslation = zTranslation * requiredXFraction / xDivider
                yTranslation = zTranslation * requiredYFraction / yDivider
            }

            // Compute a matrix for the camera
            let cameraMatrix
            if (this.programData.camera.bindYAxisToObject) {
                cameraMatrix = m4.yRotation(this.programData.camera.objectAngleYRadians)
                cameraMatrix = m4.xRotate(cameraMatrix, this.programData.camera.objectAngleXRadians)
            } else {
                cameraMatrix = this.programData.camera.lastCameraMatrix
                cameraMatrix = m4.yRotate(cameraMatrix, this.programData.camera.objectAngleYRadians)
                cameraMatrix = m4.xRotate(cameraMatrix, this.programData.camera.objectAngleXRadians)
                this.programData.camera.lastCameraMatrix = cameraMatrix
                this.programData.camera.objectAngleXRadians = 0
                this.programData.camera.objectAngleYRadians = 0
            }

            // Если надо сместить камеру относительно оси ее вращения (объект будет вращаться так же, просто камера будет смотреть не логично)
            // cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 3)
            // cameraMatrix = m4.translate(cameraMatrix, -this.cameraProgramData.xTranslation, -this.cameraProgramData.yTranslation, this.cameraProgramData.zTranslation)
            cameraMatrix = m4.translate(cameraMatrix, -xTranslation, -yTranslation, this.programData.camera.cameraZTranslation)

            let viewMatrix = m4.inverse(cameraMatrix)
            const scaleFactor = this.programData.camera.scaleFactor
            viewMatrix = m4.scale(viewMatrix, scaleFactor, scaleFactor, scaleFactor)
            const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

            const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, m4.identity())
            const worldInverseMatrix = m4.inverse(viewMatrix)
            const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix)
            this.gl.uniformMatrix4fv(this.programData.uniforms.worldViewProjectionLocation, false, worldViewProjectionMatrix)
            this.gl.uniformMatrix4fv(this.programData.uniforms.worldInverseTransposeLocation, false, worldInverseTransposeMatrix)
            this.gl.uniform4fv(this.programData.uniforms.colorLocation, [0.62, 0.62, 0.62, 1])
            this.gl.uniform3fv(this.programData.uniforms.reverseLightDirectionLocation, m4.normalize([0.5, 0.5, 1]))
            this.gl.uniform3fv(this.programData.uniforms.reverseLightDirectionLocationTwo, m4.normalize([-0.5, 0.5, 1]))
            this.gl.uniform3fv(this.programData.uniforms.reverseLightDirectionLocationThree, m4.normalize([0.5, -0.5, 1]))
            this.gl.uniform3fv(this.programData.uniforms.reverseLightDirectionLocationFour, m4.normalize([-0.5, -0.5, 1]))

            const primitiveType = this.gl.TRIANGLES
            const offset = 0
            const count = this.programData.vertexCount
            this.gl.drawArrays(primitiveType, offset, count)
        }
    }

    private enableAndSpecifyPositionAttribute(positionLocation: number, positionBuffer: WebGLBuffer | null) { // attribute vec4 a_position;
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

    private enableAndSpecifyNormalAttribute(normalLocation: number, normalBuffer: WebGLBuffer | null) {
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

    private clearCanvasAndEnable3DFeatures() {
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

    private createProgramData(program: WebGLProgram, positionLocation: number, normalLocation: number,
        worldViewProjectionLocation: WebGLUniformLocation | null, worldInverseTransposeLocation: WebGLUniformLocation | null,
        reverseLightDirectionLocation: WebGLUniformLocation | null, colorLocation: WebGLUniformLocation | null,
        positionBuffer: WebGLBuffer | null, normalBuffer: WebGLBuffer | null, reverseLightDirectionLocationTwo: WebGLUniformLocation | null,
        reverseLightDirectionLocationThree: WebGLUniformLocation | null, reverseLightDirectionLocationFour: WebGLUniformLocation | null,
        scaleFactor: number, vertexCount: number) {
        this.programData = {
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
                cameraZTranslation: 4,
                fieldOfViewRadians: this.degToRad(60),
                lastCameraMatrix: m4.identity(),
                objectAngleXRadians: 0,
                objectAngleYRadians: 0,
                scaleFactor
            },
            vertexCount
        }
    }

    private radToDeg(r: number) {
        return r * 180 / Math.PI
    }

    private degToRad(d: number) {
        return d * Math.PI / 180
    }

    private putDataInBuffer(data: number[]) {
        const float32Data = new Float32Array(data)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, float32Data, this.gl.STATIC_DRAW)
    }

    private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
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

    private createShader(type: number, source: string) {
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

    private initWebGL(): WebGL2RenderingContext | null {
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

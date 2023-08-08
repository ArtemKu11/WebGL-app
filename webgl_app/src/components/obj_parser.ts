type HandlerFunction = (line: string) => void

export interface Coordinate3D {
    x: number,
    y: number,
    z: number
}

export interface Coordinate2D {
    x: number,
    y: number,
}

export interface PointDescription {
    vertex: number,
    texture?: number,
    normal?: number
}

export interface Face {
    pointDescriptions: PointDescription[]
}

export interface WebGLData {
    vertices: number[]
    textures?: number[]
    normals?: number[]
}

export class ObjParser {
    private objectCode: string
    private keywordHandlers: Map<string, HandlerFunction> = new Map()
    private rawVertices: Coordinate3D[] = []
    private rawTextures: Coordinate2D[] = []
    private rawNormals: Coordinate3D[] = []
    private faces: Face[] = []
    private vertices: number[] = []
    private textures: number[] = []
    private normals: number[] = []

    constructor(objectCode: string) {
        this.objectCode = objectCode
        this.initKeywords()
    }

    parseObject(): WebGLData | null {
        let lines = this.objectCode.split('\n')
        lines = lines.map((item) => { // Убрать лишние пробелы
            item = item.trim()
            return item
        }).filter((item) => {
            return item !== '' && !item.startsWith('#') // Убрать комментарии
        })

        lines.forEach((line) => { // создать rawVertices, rawTextures, rawNormal, faces
            const keyword = this.getFirstWordInLine(line)
            const handler = this.keywordHandlers.get(keyword)
            if (handler) {
                handler(line)
            } else {
                console.log(`Неизвестное ключевое слово: ${keyword}`)
            }
        })
        this.parseRawData() // создать из них vertices, textures, normals

        let result: WebGLData
        if (this.vertices.length) {
            result = {
                vertices: this.vertices
            }
        } else {
            return null
        }
        if (this.textures.length) {
            result.textures = this.textures
        }
        if (this.normals.length) {
            result.normals = this.normals
        }
        if (this.resultCheck(result)) {
            return result
        } else {
            return null
        }
    }

    private resultCheck(result: WebGLData): boolean {
        if (result.vertices.length % 9 !== 0) {
            console.log('PARSING FAIL. Количество вершин не кратно 9 (Не треугольники)')
            return false
        }
        if (result.normals && result.vertices.length !== result.normals.length) {
            console.log(`PARSING FAIL. Не совпадает количество вершин (${result.vertices.length}) и нормалей (${result.normals.length})`)
            return false
        }
        if (result.textures && (result.vertices.length / 3) * 2 !== result.textures.length) {
            console.log(`PARSING FAIL. Не совпадает количество вершин (${result.vertices.length}) и текстур (${result.textures.length})`)
            return true
        }
        return true
    }

    private parseRawData() {
        for (const face of this.faces) {
            for (const pointDescription of face.pointDescriptions) {
                const vertex = this.rawVertices[pointDescription.vertex]
                if (typeof vertex !== 'undefined') {
                    this.vertices.push(vertex.x, vertex.y, vertex.z)
                } else {
                    console.log(`UNABLE TO FIND VERTEX: ${pointDescription.vertex}`)
                }

                const textureNumber = pointDescription.texture
                if (typeof textureNumber !== 'undefined') {
                    const texture = this.rawTextures[textureNumber]
                    if (typeof texture !== 'undefined') {
                        this.textures.push(texture.x, texture.y)
                    } else {
                        console.log(`UNABLE TO FIND TEXTURE: ${textureNumber}`)
                    }
                }

                const normalNumber = pointDescription.normal
                if (typeof normalNumber !== 'undefined') {
                    const normal = this.rawNormals[normalNumber]
                    if (typeof normal !== 'undefined') {
                        this.normals.push(normal.x, normal.y, normal.z)
                    } else {
                        console.log(`UNABLE TO FIND NORMALE: ${normalNumber}`)
                    }
                }
            }
        }
    }

    private initKeywords() {
        this.keywordHandlers.set('v', this.vHandler.bind(this))
        this.keywordHandlers.set('vn', this.vnHandler.bind(this))
        this.keywordHandlers.set('vt', this.vtHandler.bind(this))
        this.keywordHandlers.set('f', this.fHandler.bind(this))
    }

    private excludeKeywordAndSplit(line: string) {
        const lineArr = line.split(' ')
        if (lineArr.length) {
            return lineArr.slice(1)
        } else {
            return lineArr
        }
    }

    private parse3DCoords(line: string): Coordinate3D | null {
        const parameters = this.excludeKeywordAndSplit(line)
        if (parameters.length) {
            const parsedParameters = []
            for (const parameter of parameters) {
                if (parameter === "") {
                    continue
                }
                const parsedParameter = +parameter
                if (Number.isNaN(parsedParameter)) {
                    break
                }
                parsedParameters.push(parsedParameter)
            }
            if (parsedParameters.length >= 3) {
                return {
                    x: parsedParameters[0],
                    y: parsedParameters[1],
                    z: parsedParameters[2]
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }

    private parse2DCoords(line: string): Coordinate3D | null {
        const parameters = this.excludeKeywordAndSplit(line)
        if (parameters.length) {
            const parsedParameters = []
            for (const parameter of parameters) {
                if (parameter === "") {
                    continue
                }
                const parsedParameter = +parameter
                if (Number.isNaN(parsedParameter)) {
                    break
                }
                parsedParameters.push(parsedParameter)
            }
            if (parsedParameters.length >= 2) {
                return {
                    x: parsedParameters[0],
                    y: parsedParameters[1],
                    z: parsedParameters[2]
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }

    private vHandler(line: string) {
        const parsedCoords = this.parse3DCoords(line)
        if (parsedCoords) {
            this.rawVertices.push(parsedCoords)
        } else {
            console.log(`PARSING FAIL: ${line}`)
        }
    }

    private vnHandler(line: string) {
        const parsedCoords = this.parse3DCoords(line)
        if (parsedCoords) {
            this.rawNormals.push(parsedCoords)
        } else {
            console.log(`PARSING FAIL: ${line}`)
        }
    }

    private vtHandler(line: string) {
        const parsedCoords = this.parse2DCoords(line)
        if (parsedCoords) {
            this.rawTextures.push(parsedCoords)
        } else {
            console.log(`PARSING FAIL: ${line}`)
        }
    }

    private fHandler(line: string) {
        const parameters = this.excludeKeywordAndSplit(line)
        if (parameters.length) {
            const face: Face = {
                pointDescriptions: []
            }
            for (const parameter of parameters) {
                const parsedParameter = parameter.split('/')
                if (parsedParameter.length) {
                    const parsedVertex = this.parseNumber(parsedParameter[0])
                    const parsedTexture = this.parseNumber(parsedParameter[1])
                    const parsedNormal = this.parseNumber(parsedParameter[2])
                    if (parsedVertex === null) {
                        console.log(`PARSING FAIL: ${line}`)
                        break
                    }
                    const pointDescription: PointDescription = this.createPointDescription(parsedVertex, parsedTexture, parsedNormal)
                    face.pointDescriptions.push(pointDescription)
                    if (face.pointDescriptions.length % 3 === 0) {
                        face.pointDescriptions.push(JSON.parse(JSON.stringify(pointDescription)))
                    }
                } else {
                    console.log(`PARSING FAIL: ${line}`)
                    break
                }
            }
            if (face.pointDescriptions.length) {
                let counter = 0
                while (face.pointDescriptions.length % 3 !== 0) {
                    let pointDescription = face.pointDescriptions[counter]
                    if (!pointDescription) {
                        counter = 0
                        break
                    }
                    pointDescription = JSON.parse(JSON.stringify(pointDescription))
                    face.pointDescriptions.push(pointDescription)
                    counter++
                }
                this.faces.push(face)
            }
        } else {
            console.log(`PARSING FAIL: ${line}`)
        }
    }

    private createPointDescription(vertex: number, texture: number | null, normal: number | null): PointDescription {
        const pointDescription: PointDescription = {
            vertex: vertex - 1
        }
        if (texture !== null) {
            pointDescription.texture = texture - 1
        }

        if (normal !== null) {
            pointDescription.normal = normal - 1
        }

        return pointDescription
    }

    private parseNumber(stringNumber: string | undefined): number | null {
        if (typeof stringNumber === 'undefined' || stringNumber.trim() === '') {
            return null
        }
        const parsedNumber = +stringNumber
        if (Number.isNaN(parsedNumber)) {
            return null
        }
        return parsedNumber
    }

    private getFirstWordInLine(line: string) {
        const spaceIndex = line.indexOf(" ")
        if (spaceIndex !== -1) {
            return line.slice(0, spaceIndex)
        } else {
            return line
        }
    }
}

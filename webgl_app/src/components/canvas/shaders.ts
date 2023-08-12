export const createShander = (gl: WebGL2RenderingContext, shanderSource: string, shaderType: number): WebGLShader | null => {
    const shader = gl.createShader(shaderType)
    if (shader) {
        gl.shaderSource(shader, shanderSource)
        gl.compileShader(shader)
        return shader
    } else {
        console.log('Ошибка в gl.createShader()')
        return null
    }
}

export const shaderFs = (gl: WebGL2RenderingContext): WebGLShader | null => {
    const source = `
    void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `
    return createShander(gl, source, gl.FRAGMENT_SHADER)
}

export const shaderVs = (gl: WebGL2RenderingContext): WebGLShader | null => {
    const source = `
    attribute vec3 aVertexPosition;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    }
    `
    return createShander(gl, source, gl.VERTEX_SHADER)
}

export const easyShaderVs = (): string => {
    return `
    // Атрибут, который будет получать данные из буфера
    attribute vec4 a_position;
    
    // Для всех шейдеров
    void main() {
    
    // gl_Position - специальная переменная для вершинного шейдера, отвечающая за его реасположение
    gl_Position = a_position;
    }
    `
}

export const easyShaderFs = (): string => {
    return `
    // It means "medium precision". Некая точность
    precision mediump float;
    
    void main() {
    // gl_FragColor - специальная переменная для вершинного шейдера, отвечающая за его реасположение
    gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple (красно-фиолетовый, цвета и прозрачность)
    }
    `
}

export const vertexShaderForPixels = (): string => {
    return `
    attribute vec2 a_position;
 
    uniform vec2 u_resolution;
   
    void main() {
      // convert the position from pixels to 0.0 to 1.0
      vec2 zeroToOne = a_position / u_resolution;
   
      // convert from 0->1 to 0->2
      vec2 zeroToTwo = zeroToOne * 2.0;
   
      // convert from 0->2 to -1->+1 (clip space)
      vec2 clipSpace = zeroToTwo - 1.0;
   
      // gl_Position = vec4(clipSpace, 0, 1); - default
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); 
      // 0,0 - верхний левый угол
    }
    `
}

export const fragmentalFunctionalShader = (): string => {
    return `
    precision mediump float;
 
    uniform vec4 u_color;
   
    void main() {
      gl_FragColor = u_color;
    }
    `
}

export const varVertexShader = (): string => {
    return `
    attribute vec2 a_position;

    uniform mat3 u_matrix;

    varying vec4 v_color;

    void main() {
    // Multiply the position by the matrix.
    gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

    // Convert from clipspace to colorspace.
    // Clipspace goes -1.0 to +1.0
    // Colorspace goes from 0.0 to 1.0
    v_color = gl_Position * 0.5 + 0.5;
    }
    `
}

export const varFragmentalShader = (): string => {
    return `
    precision mediump float;

    varying vec4 v_color;

    void main() {
    gl_FragColor = v_color;
    }
    `
}

export const cameraProgramVertexShader = (): string => {
    return `
    attribute vec4 a_position;
    attribute vec4 a_color;

    uniform mat4 u_matrix;

    varying vec4 v_color;

    void main() {
        // Multiply the position by the matrix.
        gl_Position = u_matrix * a_position;
      
        // Pass the color to the fragment shader.
        v_color = a_color;
    }
    `
}

export const cameraProgramFragmentalShader = (): string => {
    return `
    precision mediump float;

    // Passed in from the vertex shader.
    varying vec4 v_color;
    
    void main() {
       gl_FragColor = v_color;
    }
    `
}

export const textureProgramVertexShader = (): string => {
    return `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    
    uniform mat4 u_matrix;
    
    varying vec2 v_texcoord;
    
    void main() {
    // Multiply the position by the matrix.
    gl_Position = u_matrix * a_position;
    
    // Pass the texcoord to the fragment shader.
    v_texcoord = a_texcoord;
    }
    `
}

export const textureProgramFragmentalShader = (): string => {
    return `
    precision mediump float;
 
    // Passed in from the vertex shader.
    varying vec2 v_texcoord;
    
    // The texture.
    uniform sampler2D u_texture;
    
    void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
    }
    `
}

export const lightningVertexShader = (): string => {
    return `
    attribute vec4 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_worldViewProjection;
    uniform mat4 u_worldInverseTranspose;

    varying vec3 v_normal;

    void main() {
    // Multiply the position by the matrix.
    gl_Position = u_worldViewProjection * a_position;

    // orient the normals and pass to the fragment shader
    v_normal = mat3(u_worldInverseTranspose) * a_normal;
    }
    `
}

export const lightningFragmentalShader = (): string => {
    return `
    precision mediump float;

    // Passed in from the vertex shader.
    varying vec3 v_normal;

    uniform vec3 u_reverseLightDirection;
    uniform vec3 u_reverseLightDirectionTwo;
    uniform vec3 u_reverseLightDirectionThree;
    uniform vec3 u_reverseLightDirectionFour;
    uniform vec4 u_color;

    void main() {
    // because v_normal is a varying it's interpolated
    // so it will not be a unit vector. Normalizing it
    // will make it a unit vector again
    vec3 normal = normalize(v_normal);

    float light = dot(normal, u_reverseLightDirection);
    float lightTwo = dot(normal, u_reverseLightDirectionTwo);
    float lightThree = dot(normal, u_reverseLightDirectionThree) * 0.8;
    float lightFour = dot(normal, u_reverseLightDirectionFour) * 0.8;

    vec3 colorOne = u_color.rgb * light;
    vec3 colorTwo = u_color.rgb * lightTwo;
    vec3 colorThree = u_color.rgb * lightThree;
    vec3 colorFour = u_color.rgb * lightFour;
    gl_FragColor = u_color;

    float brightnessOne = 0.21 * colorOne.r + 0.72 * colorOne.g + 0.07 * colorOne.b;
    float brightnessTwo = 0.21 * colorTwo.r + 0.72 * colorTwo.g + 0.07 * colorTwo.b;
    float brightnessThree = 0.21 * colorThree.r + 0.72 * colorThree.g + 0.07 * colorThree.b;
    float brightnessFour = 0.21 * colorFour.r + 0.72 * colorFour.g + 0.07 * colorFour.b;
    
    if (brightnessOne > brightnessTwo) {
        if (brightnessOne > brightnessThree) {
            if (brightnessOne > brightnessFour) {
                gl_FragColor.rgb = colorOne;
            } else {
                gl_FragColor.rgb = colorFour;
            }
        } else {
            if (brightnessThree > brightnessFour) {
                gl_FragColor.rgb = colorThree;
            } else {
                gl_FragColor.rgb = colorFour;
            }
        }
    } else {
        if (brightnessTwo > brightnessThree) {
            if (brightnessTwo > brightnessFour) {
                gl_FragColor.rgb = colorTwo;
            } else {
                gl_FragColor.rgb = colorFour;
            }
        } else {
            if (brightnessThree > brightnessFour) {
                gl_FragColor.rgb = colorThree;
            } else {
                gl_FragColor.rgb = colorFour;
            }
        }
    }
    }
    `
}

<template>
    <div class="container">
        <canvas @contextmenu.prevent="" @wheel.prevent="wheelEvent" @mousemove="mouseMoveEvent"
            @mouseleave="mouseLeaveEvent" @mouseenter="mouseLeaveEvent" ref="glcanvas" id="glcanvas" width="640"
            height="480">
            Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
        </canvas>
        <!-- <div class="value-container">
            <span>Угол камеры Y</span>
            <input @input="rotateObjectY" v-model="cameraYAngleValue" type="range" min="0" max="360" step="1">
            <span class="value-span">{{ cameraYAngleValue }}</span>
        </div>
        <div class="value-container">
            <span>Угол камеры X</span>
            <input @input="rotateObjectX" v-model="cameraXAngleValue" type="range" min="0" max="360" step="1">
            <span class="value-span">{{ cameraXAngleValue }}</span>
        </div>
        <div class="value-container">
            <span>Камера</span>
            <input @input="refreshCameraXTranslation" v-model="cameraXTranslation" type="range" min="-300" max="300"
                step="1">
            <span class="value-span">{{ cameraXTranslation }}</span>
        </div> -->
        <button @click="toDefault">Вернуть в исходное</button>
        <div class="checkbox-container">
            <input @change="checkboxEvent" id="checkbox" type="checkbox">
            <label for="checkbox">Привязать ось Y к объекту</label>
        </div>
        <form @submit.prevent="" class="download-file">
            <input ref="input" type="file">
            <button @click="server">Загрузить</button>
        </form>
        <button @click="socket">Сокет</button>
    </div>
</template>

<script lang="ts">
import { httpActions, socket } from '@/main'
import { Alerts } from '@/store/alerts/helpers'
import { InfoAlertType } from '@/store/alerts/types'
import { defineComponent } from 'vue'
import { CanvasHandler } from './canvas_handler'
import { ObjParser } from './obj_parser'
import { blenderCube } from './objects'

interface Coords {
    x: number,
    y: number
}

interface CanvasComponentData {
    canvasHandler: CanvasHandler | null,
    cameraYAngleValue: number
    cameraXAngleValue: number
    cameraYAngleLastValue: number
    cameraXAngleLastValue: number
    cameraXTranslation: number
    mouseWheel: boolean
    rightButton: boolean
    lastMouseCoords: Coords
}

export default defineComponent({
    name: 'CanvasComponent',

    data(): CanvasComponentData {
        return {
            canvasHandler: null,
            cameraYAngleValue: 0,
            cameraXAngleValue: 0,
            cameraXAngleLastValue: 0,
            cameraYAngleLastValue: 0,
            cameraXTranslation: 0,
            mouseWheel: false,
            rightButton: false,
            lastMouseCoords: this.getZeroCoords()
        }
    },

    mounted() {
        const canvas = this.$refs.glcanvas as HTMLCanvasElement
        if (canvas) {
            this.canvasHandler = new CanvasHandler(canvas)
            const parsedObject = new ObjParser(blenderCube()).parseObject()
            if (parsedObject) {
                this.canvasHandler.renderObject(parsedObject, 1)
            }
            document.addEventListener('mousedown', this.mouseWheelDownEvent)
            document.addEventListener('mouseup', this.mouseWheelUpEvent)
        }
    },

    beforeUnmount() {
        if (this.canvasHandler) {
            document.removeEventListener('mousedown', this.mouseWheelDownEvent)
            document.removeEventListener('mouseup', this.mouseWheelUpEvent)
        }
    },

    methods: {
        checkboxEvent(e: Event) {
            const target = e.target as HTMLInputElement
            if (this.canvasHandler) {
                if (target.checked) {
                    this.canvasHandler.bindYAxisToObject(true)
                } else {
                    this.canvasHandler.bindYAxisToObject(false)
                }
                this.toDefault()
            }
        },

        wheelEvent(e: WheelEvent) {
            if (this.canvasHandler) {
                if (e.deltaY > 0) {
                    this.canvasHandler.zoomCameraByPercent(10)
                    // this.canvasHandler.moveCameraByOneAxis('z', 60)
                } else {
                    this.canvasHandler.zoomCameraByPercent(-10)
                    // this.canvasHandler.moveCameraByOneAxis('z', -60)
                }
            }
        },

        getZeroCoords(): Coords {
            return {
                x: 0,
                y: 0
            }
        },

        setZeroCoords() {
            this.lastMouseCoords = this.getZeroCoords()
        },

        mouseWheelDownEvent(e: MouseEvent) {
            if (e.button === 0) {
                this.mouseWheel = true
            }
            if (e.button === 2) {
                this.rightButton = true
            }
        },

        mouseWheelUpEvent(e: MouseEvent) {
            if (e.button === 0) {
                this.mouseWheel = false
            }
            if (e.button === 2) {
                this.rightButton = false
            }
            this.setZeroCoords()
        },

        mouseMoveEvent(e: MouseEvent) {
            if (this.mouseWheel && this.canvasHandler) {
                const mouseX = e.offsetX
                const mouseY = e.offsetY
                if (this.lastMouseCoords.x === 0 && this.lastMouseCoords.y === 0) {
                    this.lastMouseCoords.x = mouseX
                    this.lastMouseCoords.y = mouseY
                    return
                }
                const xDistance = mouseX - this.lastMouseCoords.x
                const yDistance = mouseY - this.lastMouseCoords.y
                this.canvasHandler.moveCamera(xDistance, -yDistance)
                this.lastMouseCoords.x = mouseX
                this.lastMouseCoords.y = mouseY
            } else if (this.rightButton && this.canvasHandler) {
                const mouseX = e.offsetX
                const mouseY = e.offsetY
                if (this.lastMouseCoords.x === 0 && this.lastMouseCoords.y === 0) {
                    this.lastMouseCoords.x = mouseX
                    this.lastMouseCoords.y = mouseY
                    return
                }
                const yAngle = mouseX - this.lastMouseCoords.x
                const xAngle = mouseY - this.lastMouseCoords.y
                this.canvasHandler.rotateObject(-xAngle, -yAngle)
                this.lastMouseCoords.x = mouseX
                this.lastMouseCoords.y = mouseY
            }
        },

        mouseLeaveEvent() {
            // this.mouseWheel = false
            // this.setZeroCoords()
        },

        rotateObjectY() {
            const diff = this.cameraYAngleValue - this.cameraYAngleLastValue
            this.cameraYAngleLastValue = this.cameraYAngleValue
            if (this.canvasHandler) {
                this.canvasHandler.rotateObjectY(diff)
            }
        },

        rotateObjectX() {
            const diff = this.cameraXAngleValue - this.cameraXAngleLastValue
            this.cameraXAngleLastValue = this.cameraXAngleValue
            if (this.canvasHandler) {
                this.canvasHandler.rotateObjectX(diff)
            }
        },

        refreshCameraXTranslation() {
            if (this.canvasHandler) {
                this.canvasHandler.setCameraXTranslation(this.cameraXTranslation)
            }
        },

        toDefault() {
            this.cameraXAngleValue = 0
            this.cameraYAngleValue = 0
            this.cameraXTranslation = 0
            if (this.canvasHandler) {
                this.canvasHandler.toDefault()
            }
        },

        async server() {
            const input = this.$refs.input as HTMLInputElement
            if (input) {
                const files = input.files
                if (files?.length) {
                    const webGlData = await httpActions.parseObject(files[0])
                    if (webGlData && this.canvasHandler) {
                        this.canvasHandler.renderObject(webGlData)
                    }
                } else {
                    const alert: InfoAlertType = {
                        message: 'Файл не выбран',
                        type: 'red'
                    }
                    Alerts.showInfoAlert(alert)
                }
            }
            // const result = await httpClient.post('/parse_stl')
            // console.log(result)
        },

        socket() {
            socket.emit()
        }
    }
})
</script>

<style lang='scss' scoped>
.container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    #glcanvas {
        border: 1px solid black;
    }

    .value-container {
        display: flex;
        align-items: center;
        gap: 10px;

        .value-span {
            width: 30px;
        }
    }

    .download-file {
        display: flex;
        gap: 20px;
    }

}
</style>

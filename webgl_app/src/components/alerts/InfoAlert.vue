<template>
    <div @click="clickHandler" ref="infoAlert" class="info-alert" :class="{ 'green': green, 'red': red }">
        <span class="message-holder" v-html="infoAlert.message">
        </span>
    </div>
</template>

<script lang="ts">
import { AlertType, InfoAlertType } from '@/store/alerts/types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'InfoAlert',
    data() {
        return {
            currentTimeout: 0
        }
    },

    computed: {
        infoAlert: {
            get(): InfoAlertType {
                return this.$store.getters['alerts/getInfoAlert']()
            },
            set(newAlert: InfoAlertType | null) {
                this.$store.state.alerts.infoAlertState.currentMessage = newAlert
            }
        },
        cancellationToken(): boolean {
            return this.$store.state.alerts.infoAlertState.cancellationToken
        },

        green(): boolean {
            return this.infoAlert.type?.toLowerCase() === 'green'
        },
        red(): boolean {
            return this.infoAlert.type?.toLowerCase() === 'red'
        }
    },

    watch: {
        cancellationToken() {
            if (this.cancellationToken) {
                if (this.currentTimeout) {
                    clearTimeout(this.currentTimeout)
                }
                // eslint-disable-next-line
                this.infoAlert = null as any
            }
        }
    },

    mounted() {
        this.showingAnimation()
    },

    methods: {
        showingAnimation() {
            const element = this.$refs.infoAlert as HTMLElement
            if (element) {
                const height = element.getBoundingClientRect().height
                this.animationProcessing(element, height)
                let timeout = 5000
                if (this.infoAlert.time) {
                    timeout = this.infoAlert.time
                }
                this.currentTimeout = setTimeout(this.closingAnimation, timeout)
            }
        },

        animationProcessing(element: HTMLElement, height: number) {
            if (height < 0) return
            element.style.top = -height + 'px'
            this.currentTimeout = setTimeout(() => {
                height = height - 2
                this.animationProcessing(element, height)
            }, 0)
        },

        closingAnimation() {
            const element = this.$refs.infoAlert as HTMLElement
            if (element) {
                const height = element.getBoundingClientRect().height
                this.closingAnimationProcessing(element, 0, height)
            }
        },

        closingAnimationProcessing(element: HTMLElement, height: number, originalHeight: number) {
            height = height - 2
            if (height < -originalHeight) {
                // eslint-disable-next-line
                this.infoAlert = null as any
                return
            }
            element.style.top = height + 'px'
            this.currentTimeout = setTimeout(() => {
                this.closingAnimationProcessing(element, height, originalHeight)
            }, 0)
        },

        clickHandler() {
            const alert: AlertType = {
                message: this.infoAlert.message,
                type: 'ok'
            }
            this.$store.dispatch('alerts/addToAlertQueue', alert)
        }
    }
})
</script>

<style lang="scss">
.info-alert {
    z-index: 10;
    left: 20%;
    right: 20%;
    position: absolute;
    margin: 0 auto;
    padding: 20px 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(196, 196, 196, 0.9);
    border: 2px solid #6B6B6B;
    border-top: none;
    border-radius: 0px 0px 6px 6px;
    max-width: 60%;

    &.green {
        border-color: green;
        // border-color: rgb(72, 255, 0);
    }

    &.red {
        border-color: red;
    }

    span {
        text-align: center;
        color: black;
        font-family: 'Arial';
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 29px;
        // text-align: center;
    }
}

// }
</style>

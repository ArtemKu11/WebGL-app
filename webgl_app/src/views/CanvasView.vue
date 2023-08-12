<template>
    <CanvasComponent />
    <InfoAlert v-if="infoAlertFlag" />
    <DefaultAlert v-if="defaultAlertFlag" />
    <DefaultLoader v-if="hasWaits" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CanvasComponent from '@/components/canvas/CanvasComponent.vue'
import InfoAlert from '@/components/alerts/InfoAlert.vue'
import DefaultAlert from '@/components/alerts/DefaultAlert.vue'
import DefaultLoader from '@/components/canvas/Loader.vue'

export default defineComponent({
    name: 'CanvasView',
    components: { CanvasComponent, InfoAlert, DefaultAlert, DefaultLoader },
    computed: {
        infoAlertFlag() {
            return this.$store.getters['alerts/getInfoAlertFlag']()
        },

        defaultAlertFlag() {
            return this.$store.getters['alerts/getAlertFlag']()
        },

        hasWaits() {
            return this.$store.getters['waits/hasWaits']
        }
    }
})
</script>

<style lang='scss'></style>

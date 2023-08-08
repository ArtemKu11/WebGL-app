<template>
    <CanvasComponent />
    <InfoAlert v-if="infoAlertFlag" />
    <DefaultAlert v-if="defaultAlertFlag"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CanvasComponent from '@/components/CanvasComponent.vue'
import InfoAlert from '@/components/alerts/InfoAlert.vue'
import DefaultAlert from '@/components/alerts/DefaultAlert.vue'

export default defineComponent({
    name: 'CanvasView',
    components: { CanvasComponent, InfoAlert, DefaultAlert },
    computed: {
        infoAlertFlag() {
            return this.$store.getters['alerts/getInfoAlertFlag']()
        },

        defaultAlertFlag() {
            return this.$store.getters['alerts/getAlertFlag']()
        }
    }
})
</script>

<style lang='scss'></style>

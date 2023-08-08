<template>
    <div class="content-container default-alert">
        <div class="alert-holder">
            <span class="header" v-if="alert.header">
                {{ alert.header }}
            </span>
            <div class="message-holder" v-if="alert.message" v-html="alert.message">
            </div>
            <div class="buttons-holder yes-no" v-if="alert.type.toLowerCase() === 'yes_no'">
                <button @click="confirmClick">ДА</button>
                <button @click="rejectClick">НЕТ</button>
            </div>
            <div class="buttons-holder ok" v-else>
                <button @click="confirmClick">OK</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AlertType } from '@/store/alerts/types'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'DefaultAlert',
    computed: {
        alert(): AlertType {
            return this.$store.getters['alerts/getFirstAlert']()
        }
    },

    methods: {
        confirmClick() {
            this.$store.dispatch('alerts/confirmClick')
        },

        rejectClick() {
            this.$store.dispatch('alerts/rejectClick')
        }
    }
})

</script>

<style lang="scss">
// @import "@/layouts/base_layout/css/base_layout.scss";

.content-container.default-alert {
    // min-height: $minHeight;
    position: absolute;
    top: 0px;
    z-index: 5;
    height: 100%;
    width: 100%;
    background: rgba(21, 21, 21, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
    min-width: 600px;

    span {
        color: white;
        font-family: 'Arial';
        font-style: normal;
        font-weight: 400;
        font-size: 25px;
        line-height: 29px;
    }

    button {
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
        -webkit-tap-highlight-color: transparent;
    }

    .alert-holder {
        // background-color: black;
        background: rgba(0, 0, 0, 0.5);
        padding: 30px 40px;
        border-radius: 10px;
        border: 2px solid #6B6B6B;

        display: flex;
        flex-direction: column;
        place-items: center;
        max-width: 60%;

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .message-holder {
            text-align: center;
            color: white;
            font-family: 'Arial';
            font-style: normal;
            font-weight: 400;
            font-size: 25px;
            // line-height: 29px;
            line-height: 1.5;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .buttons-holder {
        margin-top: 30px;
        width: 100%;

        &.yes-no {
            display: flex;
            justify-content: space-evenly;

            button {
                background: none;
                border: none;
                cursor: pointer;
                width: 100px;
                height: 50px;
                border: 2px solid #6B6B6B;
                border-radius: 6px;
                font-size: 20px;
                color: white;

                &:active {
                    border: 2px solid white;
                }
            }
        }

        &.ok {
            text-align: center;

            button {
                background: none;
                border: none;
                cursor: pointer;
                width: 100px;
                height: 50px;
                border: 2px solid #6B6B6B;
                border-radius: 6px;
                font-size: 20px;
                color: white;

                &:active {
                    border: 2px solid white;
                }
            }
        }
    }
}
</style>

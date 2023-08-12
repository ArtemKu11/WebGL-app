import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Alerts } from './store/alerts/helpers'
import { HttpActions } from './api/httpActions'
import { SocketClient } from './api/socketClient'

createApp(App).use(store).use(router).mount('#app')
Alerts.dispatch = store.dispatch
export const httpActions = new HttpActions(store)
export const socket = createSocket()

function createSocket(): SocketClient {
    console.log('Попытка создать сокет')
    const socketClient = new SocketClient(store)
    socketClient.connect()
    return socketClient
}

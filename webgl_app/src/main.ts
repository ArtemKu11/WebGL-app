import { createApp } from 'vue'
import App from './App.vue'
import { HttpActions } from './api/httpActions'
import { SocketActions } from './api/socketActions'
import router from './router'
import store from './store'
import { Alerts } from './store/alerts/helpers'

createApp(App).use(store).use(router).mount('#app')
Alerts.dispatch = store.dispatch
export const httpActions = new HttpActions(store)
export const socketActions = new SocketActions(store)

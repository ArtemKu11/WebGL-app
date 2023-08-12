import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Alerts } from './store/alerts/helpers'
import { HttpActions } from './api/httpActions'

createApp(App).use(store).use(router).mount('#app')
Alerts.dispatch = store.dispatch
export const httpActions = new HttpActions(store)

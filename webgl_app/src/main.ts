import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { Alerts } from './store/alerts/helpers'

createApp(App).use(store).use(router).mount('#app')
Alerts.dispatch = store.dispatch

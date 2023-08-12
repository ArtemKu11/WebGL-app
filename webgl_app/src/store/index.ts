import { createStore } from 'vuex'
import { alerts } from './alerts'
import { waits } from './waits'
import { socket } from './socket'

export default createStore({
    getters: {
    },
    mutations: {
    },
    actions: {
    },
    modules: {
        alerts,
        waits,
        socket
    }
})

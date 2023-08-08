import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'
import CanvasView from '@/views/CanvasView.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: CanvasView
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes
})

export default router

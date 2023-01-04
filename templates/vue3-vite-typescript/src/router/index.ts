import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

export function setupRouter(app: App) {
  app.use(router)
}

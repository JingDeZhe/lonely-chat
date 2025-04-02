import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/views/layout/MainLayout.vue'

// 自动导入模块路由
const moduleRoutes = Object.values(
  import.meta.glob<RouteRecordRaw[]>('./modules/*.ts', {
    eager: true,
    import: 'default'
  })
).flat()

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/chat',
    children: [...moduleRoutes]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/views/layout/MainLayout.vue'
import Auth from '@/views/Auth.vue'
import { useUserStore } from '@/stores/user'

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
  },
  {
    path: '/auth',
    name: 'auth',
    component: Auth,
    meta: { skipAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  if (!to.meta.skipAuth && !userStore.currentUser) {
    next('/auth')
  } else {
    next()
  }
})

export default router

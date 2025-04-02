import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/chat',
    name: 'Chat',
    meta: {
      title: '聊天',
      icon: 'i-tabler-message-circle'
    },
    component: () => import('@/views/modules/chat/Chat.vue'),
    children: [
      {
        path: ':id',
        name: 'ChatDetail',
        component: () => import('@/views/modules/chat/ChatDetail.vue'),
        meta: {
          title: '聊天详情',
          hidden: true
        },
        props: true
      }
    ]
  }
]

export default routes

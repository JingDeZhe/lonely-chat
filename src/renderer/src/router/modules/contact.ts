import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/contact',
    name: 'Contact',
    meta: {
      title: '联系人',
      icon: 'i-tabler-users'
    },
    component: () => import('@/views/modules/contact/Contact.vue'),
    children: [
      {
        path: ':id',
        name: 'contactDetail',
        component: () => import('@/views/modules/contact/ContactDetail.vue'),
        meta: {
          title: '联系人详情',
          hidden: true
        },
        props: true
      }
    ]
  }
]

export default routes

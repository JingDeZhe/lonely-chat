import { toDeepRaw } from '@/utils'
import type { User } from '@main/db/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 登录
  const login = async (lonelychatId: string) => {
    try {
      loading.value = true
      error.value = null
      const user = await window.electronAPI.db.getUser(lonelychatId)
      if (user) {
        currentUser.value = user
      } else {
        error.value = '用户不存在'
      }
    } catch (err) {
      error.value = '登录失败'
      console.error('登录失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      error.value = null
      console.log('注册用户数据', user)
      const userId = await window.electronAPI.db.addOrUpdateUser(toDeepRaw(user))
      if (userId) {
        const newUser = await window.electronAPI.db.getUser(user.lonelychat_id)
        if (newUser) {
          currentUser.value = newUser
        }
      }
    } catch (err) {
      error.value = '注册失败'
      console.error('注册失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    currentUser.value = null
  }

  return {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  }
})

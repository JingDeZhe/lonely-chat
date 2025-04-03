<!-- src/views/AuthView.vue -->
<script setup lang="ts">
import { useUserStore } from '../stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 登录表单
const loginForm = ref({
  lonelychatId: ''
})

// 注册表单
const registerForm = ref({
  lonelychat_id: '',
  nickname: '',
  avatar: '',
  remark: ''
})

// 登录处理
const handleLogin = async () => {
  if (!loginForm.value.lonelychatId.trim()) {
    message.error('请输入LonelyChat ID')
    return
  }

  await userStore.login(loginForm.value.lonelychatId)
  if (userStore.currentUser) {
    message.success('登录成功')
    router.push('/')
  }
}

// 注册处理
const handleRegister = async () => {
  if (!registerForm.value.lonelychat_id.trim()) {
    message.error('请输入LonelyChat ID')
    return
  }
  if (!registerForm.value.nickname.trim()) {
    message.error('请输入昵称')
    return
  }

  await userStore.register(registerForm.value)
  if (userStore.currentUser) {
    message.success('注册成功')
    router.push('/')
  }
}
</script>

<template>
  <div class="min-h-screen flex justify-center bg-gray-100 dark:bg-gray-900 p-4 pt-[8em]">
    <div class="w-full max-w-md bg-white p-5 rounded shadow h-max">
      <n-tabs default-value="login" type="line" animated>
        <n-tab-pane name="login" tab="登录">
          <n-form :model="loginForm" @submit.prevent="handleLogin">
            <n-form-item label="名称" path="lonelychatId">
              <n-input v-model:value="loginForm.lonelychatId" placeholder="请输入您的名称" :disabled="userStore.loading" />
            </n-form-item>

            <n-button type="primary" attr-type="submit" block :loading="userStore.loading"
              :disabled="userStore.loading">
              登录
            </n-button>
          </n-form>

          <div v-if="userStore.error" class="mt-4 text-red-500 dark:text-red-400 text-sm">
            {{ userStore.error }}
          </div>
        </n-tab-pane>
        <n-tab-pane name="register" tab="注册">
          <n-form :model="registerForm" @submit.prevent="handleRegister">
            <n-form-item label="名称" path="lonelychat_id">
              <n-input v-model:value="registerForm.lonelychat_id" placeholder="请输入您的名称" :disabled="userStore.loading" />
            </n-form-item>

            <n-form-item label="昵称" path="nickname">
              <n-input v-model:value="registerForm.nickname" placeholder="请输入昵称" :disabled="userStore.loading" />
            </n-form-item>

            <n-form-item label="头像URL" path="avatar">
              <n-input v-model:value="registerForm.avatar" placeholder="请输入头像URL (可选)" :disabled="userStore.loading" />
            </n-form-item>

            <n-form-item label="备注" path="remark">
              <n-input v-model:value="registerForm.remark" placeholder="请输入备注 (可选)" :disabled="userStore.loading" />
            </n-form-item>

            <n-button type="primary" attr-type="submit" block :loading="userStore.loading"
              :disabled="userStore.loading">
              注册
            </n-button>
          </n-form>

          <div v-if="userStore.error" class="mt-4 text-red-500 dark:text-red-400 text-sm">
            {{ userStore.error }}
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

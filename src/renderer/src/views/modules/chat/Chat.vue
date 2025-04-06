<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { ConversationType } from '@main/db/types'

const userStore = useUserStore()
const chatStore = useChatStore()
const message = useMessage()

const newMessage = ref('')

// 加载初始数据
onMounted(async () => {
  await chatStore.loadConversations()
  if (chatStore.currentConversationId) {
    await chatStore.loadMessages(chatStore.currentConversationId)
  }
})

// 发送消息
const handleSendMessage = async () => {
  if (!newMessage.value.trim()) {
    message.warning('消息内容不能为空')
    return
  }

  await chatStore.sendMessage(newMessage.value)
  newMessage.value = ''
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// 计算未读消息数
const unreadCount = computed(() => {
  // 这里可以根据需要实现未读消息计数逻辑
  return 0
})
</script>

<template>
  <n-layout has-sider class="h-screen">
    <!-- 左侧边栏 - 对话列表 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      show-trigger
      class="h-full"
    >
      <n-scrollbar class="h-full">
        <n-list hoverable clickable>
          <n-list-item
            v-for="conversation in chatStore.conversations"
            :key="conversation.id"
            @click="chatStore.setCurrentConversation(conversation.id!)"
            :class="{
              'bg-gray-100 dark:bg-gray-800': conversation.id === chatStore.currentConversationId
            }"
          >
            <template #prefix>
              <n-badge :value="unreadCount" :max="99">
                <n-avatar
                  round
                  :src="
                    conversation.sender_avatar ||
                    'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
                  "
                />
              </n-badge>
            </template>

            <n-thing
              :title="conversation.title || conversation.sender_name"
              :description="conversation.last_message_content"
              :content="formatTime(conversation.last_message_time!)"
            />
          </n-list-item>
        </n-list>
      </n-scrollbar>
    </n-layout-sider>

    <!-- 右侧内容区 - 聊天详情 -->
    <n-layout-content class="h-full flex flex-col">
      <!-- 聊天标题栏 -->
      <div class="border-b dark:border-gray-700 p-4 flex items-center">
        <n-avatar
          round
          :src="
            chatStore.currentConversation?.sender_avatar ||
            'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
          "
        />
        <div class="ml-3">
          <div class="font-medium">
            {{
              chatStore.currentConversation?.title ||
              chatStore.currentConversation?.sender_name ||
              '选择对话'
            }}
          </div>
          <div class="text-xs text-gray-500">
            {{ chatStore.currentConversation?.type === ConversationType.PRIVATE ? '私聊' : '群聊' }}
          </div>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="flex-1 overflow-hidden">
        <n-scrollbar class="h-full p-4">
          <div v-for="msg in chatStore.messages" :key="msg.id" class="mb-4">
            <div
              class="flex"
              :class="{ 'justify-end': msg.sender_id === userStore.currentUser?.id }"
            >
              <div v-if="msg.sender_id !== userStore.currentUser?.id" class="mr-3">
                <n-avatar
                  round
                  :src="
                    msg.sender_avatar ||
                    'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
                  "
                />
              </div>

              <div class="max-w-xs md:max-w-md lg:max-w-lg">
                <div
                  v-if="msg.sender_id !== userStore.currentUser?.id"
                  class="text-xs text-gray-500 mb-1"
                >
                  {{ msg.sender_name }}
                </div>
                <div
                  class="px-4 py-2 rounded-lg"
                  :class="{
                    'bg-blue-500 text-white': msg.sender_id === userStore.currentUser?.id,
                    'bg-gray-200 dark:bg-gray-700': msg.sender_id !== userStore.currentUser?.id
                  }"
                >
                  {{ msg.content }}
                </div>
                <div class="text-xs text-gray-500 mt-1 text-right">
                  {{ formatTime(msg.created_at!) }}
                </div>
              </div>

              <div v-if="msg.sender_id === userStore.currentUser?.id" class="ml-3">
                <n-avatar
                  round
                  :src="
                    userStore.currentUser?.avatar ||
                    'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
                  "
                />
              </div>
            </div>
          </div>
        </n-scrollbar>
      </div>

      <!-- 消息输入区 -->
      <div class="border-t dark:border-gray-700 p-4">
        <n-space vertical>
          <n-input
            v-model:value="newMessage"
            type="textarea"
            placeholder="输入消息..."
            :autosize="{ minRows: 1, maxRows: 4 }"
            @keyup.enter="handleSendMessage"
          />
          <div class="flex justify-end">
            <n-button type="primary" @click="handleSendMessage" :loading="chatStore.loading">
              发送
            </n-button>
          </div>
        </n-space>
      </div>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
/* 自定义滚动条样式 */
.n-scrollbar-container {
  scrollbar-width: thin;
}

/* 消息气泡动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}
.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

// stores/chat.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  MessageStatus,
  type ConversationWithLastMessage,
  type MessageWithSender
} from '@main/db/types'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ConversationWithLastMessage[]>([])
  const currentConversationId = ref<number>()
  const messages = ref<MessageWithSender[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 获取当前对话
  const currentConversation = computed(() => {
    return conversations.value.find((c) => c.id === currentConversationId.value)
  })

  // 加载对话列表
  const loadConversations = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await window.electronAPI.db.getConversations()
      conversations.value = data
      if (data.length > 0 && !currentConversationId.value) {
        currentConversationId.value = data[0].id
      }
    } catch (err) {
      error.value = '加载对话失败'
      console.error('加载对话失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 加载消息
  const loadMessages = async (conversationId: number) => {
    try {
      loading.value = true
      error.value = null
      const data = await window.electronAPI.db.getMessages(conversationId)
      messages.value = data
    } catch (err) {
      error.value = '加载消息失败'
      console.error('加载消息失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 切换当前对话
  const setCurrentConversation = async (conversationId: number) => {
    currentConversationId.value = conversationId
    await loadMessages(conversationId)
  }

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!currentConversationId.value) return

    try {
      loading.value = true
      const userStore = useUserStore()
      if (!userStore.currentUser) return

      const message = {
        conversation_id: currentConversationId.value,
        sender_id: userStore.currentUser.id!,
        type: 0, // 文本消息
        content,
        status: MessageStatus.SENDING
      }

      const messageId = await window.electronAPI.db.addMessage(message)
      await loadMessages(currentConversationId.value)

      // 更新对话列表的最后消息
      await loadConversations()

      return messageId
    } catch (err) {
      error.value = '发送消息失败'
      console.error('发送消息失败:', err)
    } finally {
      loading.value = false
    }
    return
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    setCurrentConversation,
    sendMessage
  }
})

import { ConversationWithLastMessage, Message, MessageWithSender, User } from '../main/db/types'

// 定义所有 IPC 通道和方法
export interface IpcApi {
  // 窗口控制
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<void>
  close: () => Promise<void>

  // 窗口状态事件
  onMaximized: (callback: () => void) => void
  onUnmaximized: (callback: () => void) => void

  // 数据库相关方法
  db: {
    getUser: (lonelychatId: string) => Promise<User | undefined>
    addOrUpdateUser: (user: User) => Promise<number>
    getConversations: (limit?: number, offset?: number) => Promise<ConversationWithLastMessage[]>
    getMessages: (
      conversationId: number,
      limit?: number,
      offset?: number
    ) => Promise<MessageWithSender[]>
    addMessage: (message: Message) => Promise<number>
  }
}

// 从主进程暴露给渲染进程的 API 类型
export type ExposedApi = Readonly<IpcApi>

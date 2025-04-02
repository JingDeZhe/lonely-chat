import { ipcMain } from 'electron'
import { lonelyChatDB } from './db'
import { User, Message } from './types'

export function setupDatabaseIPC() {
  // 用户相关
  ipcMain.handle('db-add-or-update-user', (_event, user: User) => {
    return lonelyChatDB.addOrUpdateUser(user)
  })

  ipcMain.handle('db-get-user', (_event, lonelychatId: string) => {
    return lonelyChatDB.getUser(lonelychatId)
  })

  // 会话相关
  ipcMain.handle(
    'db-create-conversation',
    (_event, type: number, title: string, memberIds: number[]) => {
      return lonelyChatDB.createConversation(type, title, memberIds)
    }
  )

  ipcMain.handle('db-get-conversations', (_event, limit: number = 20, offset: number = 0) => {
    return lonelyChatDB.getConversations(limit, offset)
  })

  // 消息相关
  ipcMain.handle('db-add-message', (_event, message: Message) => {
    return lonelyChatDB.addMessage(message)
  })

  ipcMain.handle(
    'db-get-messages',
    (_event, conversationId: number, limit: number = 50, offset: number = 0) => {
      return lonelyChatDB.getMessages(conversationId, limit, offset)
    }
  )

  // 维护相关
  ipcMain.handle('db-optimize', () => {
    lonelyChatDB.optimize()
  })

  ipcMain.handle('db-vacuum', () => {
    lonelyChatDB.vacuum()
  })
}

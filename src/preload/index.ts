import { contextBridge, ipcRenderer } from 'electron'
import { ExposedApi } from './types'

// Custom APIs for renderer
const electronAPI: ExposedApi = {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window-toggle-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  onMaximized: (fn: Function) => {
    ipcRenderer.on('window-maximized', () => {
      fn()
    })
  },
  onUnmaximized: (fn: Function) => {
    ipcRenderer.on('window-unmaximized', () => {
      fn()
    })
  },

  // 数据库方法
  db: {
    getUser: (lonelychatId) => ipcRenderer.invoke('db-get-user', lonelychatId),
    addOrUpdateUser: (user) => ipcRenderer.invoke('db-add-or-update-user', user),
    getConversations: (limit = 20, offset = 0) =>
      ipcRenderer.invoke('db-get-conversations', limit, offset),
    getMessages: (conversationId, limit = 50, offset = 0) =>
      ipcRenderer.invoke('db-get-messages', conversationId, limit, offset),
    addMessage: (message) => ipcRenderer.invoke('db-add-message', message)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

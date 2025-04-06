import path from 'path'
import Database from 'better-sqlite3'
import { app } from 'electron'
import {
  User,
  Message,
  ConversationType,
  MemberRole,
  MessageStatus,
  MessageWithSender,
  ConversationWithLastMessage
} from './types'

export class LonelyChatDB {
  private db: Database.Database
  private static instance: LonelyChatDB

  private constructor() {
    const dbPath = path.join(app.getPath('userData'), 'lonelychat.db')
    this.db = new Database(dbPath, {
      // verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    })
    this.initDatabase()
  }

  public static getInstance(): LonelyChatDB {
    if (!LonelyChatDB.instance) {
      LonelyChatDB.instance = new LonelyChatDB()
    }
    return LonelyChatDB.instance
  }

  public close(): void {
    if (this.db) {
      this.db.close()
      this.db = null as any
    }
  }

  private initDatabase(): void {
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')

    // 用户表
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lonelychat_id TEXT UNIQUE NOT NULL,
        nickname TEXT,
        avatar TEXT,
        remark TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `
      )
      .run()

    // 会话表
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type INTEGER NOT NULL,
        title TEXT,
        last_message_id INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL
      )
    `
      )
      .run()

    // 会话成员表
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role INTEGER DEFAULT ${MemberRole.NORMAL},
        joined_at INTEGER DEFAULT (strftime('%s', 'now')),
        PRIMARY KEY (conversation_id, user_id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
      )
      .run()

    // 消息表
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        type INTEGER NOT NULL,
        content TEXT,
        status INTEGER DEFAULT ${MessageStatus.SENDING},
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `
      )
      .run()

    // 创建索引
    this.db
      .prepare('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)')
      .run()
    this.db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)').run()
    this.db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)').run()
  }

  // 用户操作
  public addOrUpdateUser(user: User): number {
    const stmt = this.db.prepare(`
      INSERT INTO users (lonelychat_id, nickname, avatar, remark)
      VALUES (@lonelychat_id, @nickname, @avatar, @remark)
      ON CONFLICT(lonelychat_id) DO UPDATE SET
        nickname = excluded.nickname,
        avatar = excluded.avatar,
        remark = excluded.remark,
        updated_at = strftime('%s', 'now')
    `)
    const result = stmt.run(user)
    return result.lastInsertRowid as number
  }

  public getUser(lonelychatId: string): User | undefined {
    return this.db.prepare('SELECT * FROM users WHERE lonelychat_id = ?').get(lonelychatId) as User
  }

  public getUserById(userId: number): User | undefined {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User
  }

  // 会话操作
  public createConversation(
    type: ConversationType,
    title: string,
    memberIds: number[] = []
  ): number {
    return this.db.transaction(() => {
      // 创建会话
      const convStmt = this.db.prepare(`
        INSERT INTO conversations (type, title) VALUES (?, ?)
      `)
      const result = convStmt.run(type, title)
      const convId = result.lastInsertRowid as number

      // 添加成员
      const memberStmt = this.db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)
      `)
      for (const userId of memberIds) {
        memberStmt.run(convId, userId)
      }

      return convId
    })()
  }

  // 消息操作
  public addMessage(message: Message): number {
    return this.db.transaction(() => {
      // 插入消息
      const stmt = this.db.prepare(`
        INSERT INTO messages (conversation_id, sender_id, type, content, status)
        VALUES (@conversation_id, @sender_id, @type, @content, @status)
      `)
      const result = stmt.run(message)
      const messageId = result.lastInsertRowid as number

      // 更新会话的最后消息时间
      this.db
        .prepare(
          `
        UPDATE conversations
        SET last_message_id = ?, updated_at = strftime('%s', 'now')
        WHERE id = ?
      `
        )
        .run(messageId, message.conversation_id)

      return messageId
    })()
  }

  // 查询操作
  public getConversations(limit: number = 20, offset: number = 0): ConversationWithLastMessage[] {
    return this.db
      .prepare(
        `
      SELECT c.*, m.content AS last_message_content,
             m.created_at AS last_message_time, u.nickname AS sender_name, u.avatar AS sender_avatar
      FROM conversations c
      LEFT JOIN messages m ON c.last_message_id = m.id
      LEFT JOIN users u ON m.sender_id = u.id
      ORDER BY c.updated_at DESC
      LIMIT ? OFFSET ?
    `
      )
      .all(limit, offset) as ConversationWithLastMessage[]
  }

  public getMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): MessageWithSender[] {
    return this.db
      .prepare(
        `
      SELECT m.*, u.nickname AS sender_name, u.avatar AS sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `
      )
      .all(conversationId, limit, offset) as MessageWithSender[]
  }

  // 维护操作
  public optimize(): void {
    this.db.pragma('optimize')
  }

  public vacuum(): void {
    this.db.pragma('vacuum')
  }

  //@ts-ignore
  private handleDatabaseError(error: any): never {
    if (error.code === 'SQLITE_CORRUPT' || error.code === 'SQLITE_NOTADB') {
      this.recoverDatabase()
      throw new Error('Database corrupted and recovery attempted. Please try again.')
    }
    console.error('Database error:', error)
    throw error
  }

  private recoverDatabase(): void {
    const backupPath = path.join(app.getPath('userData'), `lonelychat-corrupt-${Date.now()}.db`)

    // 备份损坏的数据库
    this.db
      .backup(backupPath)
      .then(() => {
        console.log('Corrupt database backed up to:', backupPath)
      })
      .catch((backupError) => {
        console.error('Failed to backup corrupt database:', backupError)
      })
      .finally(() => {
        // 重新初始化数据库
        this.close()
        this.db = new Database(path.join(app.getPath('userData'), 'lonelychat.db'))
        this.initDatabase()
      })
  }
}

// 导出单例
export const lonelyChatDB = LonelyChatDB.getInstance()

import { type Database } from 'better-sqlite3'

export function initDatabase(db: Database) {
  db.pragma('journal_mode = WAL') // 更好的并发性能
  db.pragma('foreign_keys = ON') // 启用外键约束

  // 用户表
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wechat_id TEXT UNIQUE NOT NULL,
      nickname TEXT,
      avatar TEXT,
      remark TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `
  ).run()

  // 聊天会话表
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type INTEGER NOT NULL, -- 1: 私聊, 2: 群聊
      title TEXT,
      last_message_id INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL
    )
  `
  ).run()

  // 会话成员关联表
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS conversation_members (
      conversation_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role INTEGER DEFAULT 0, -- 0: 普通成员, 1: 管理员, 2: 群主
      joined_at INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `
  ).run()

  // 消息表
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      type INTEGER NOT NULL, -- 1: 文本, 2: 图片, 3: 语音, 4: 视频, etc.
      content TEXT,
      status INTEGER DEFAULT 0, -- 0: 发送中, 1: 已发送, 2: 已读
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `
  ).run()

  // 创建索引提高查询性能
  db.prepare(
    'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)'
  ).run()
  db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)').run()
  db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)').run()
}

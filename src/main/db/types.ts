// 用户类型
export interface User {
  id?: number
  lonelychat_id: string
  nickname?: string
  avatar?: string
  remark?: string
  is_ai?: boolean
  ai_profile?: string // JSON字符串存储AI特性
  created_at?: number
  updated_at?: number
}

// 会话类型
export enum ConversationType {
  PRIVATE = 1,
  GROUP = 2
}

export interface Conversation {
  id?: number
  type: ConversationType
  title?: string
  last_message_id?: number
  created_at?: number
  updated_at?: number
}

// 会话成员角色
export enum MemberRole {
  NORMAL = 0,
  ADMIN = 1,
  OWNER = 2
}

export interface ConversationMember {
  conversation_id: number
  user_id: number
  role?: MemberRole
  joined_at?: number
}

// 消息类型
export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  AUDIO = 3,
  VIDEO = 4
}

export enum MessageStatus {
  SENDING = 0,
  SENT = 1,
  READ = 2
}

export interface Message {
  id?: number
  conversation_id: number
  sender_id: number
  type: MessageType
  content?: string
  status?: MessageStatus
  created_at?: number
}

// 扩展类型用于UI显示
export interface ConversationWithLastMessage extends Conversation {
  last_message_content?: string
  last_message_time?: number
  sender_name?: string
  sender_avatar?: string
}

export interface MessageWithSender extends Message {
  sender_name?: string
  sender_avatar?: string
}

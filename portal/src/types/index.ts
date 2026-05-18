export type Role = 'parent' | 'teacher' | 'admin'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: Role
  phone: string | null
  notify_email: boolean
  notify_sms: boolean
  onboarding_status: 'pending' | 'active' | 'suspended'
  created_at: string
}

export interface Child {
  id: string
  name: string
  birth_date: string
  group_name: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  child_id: string | null
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface Ticket {
  id: string
  parent_id: string
  child_id: string | null
  subject: string
  status: 'open' | 'in_progress' | 'closed'
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  body: string
  created_at: string
  sender?: { full_name: string; role: Role }
}

export interface Observation {
  id: string
  child_id: string
  teacher_id: string
  category: string
  situation: string
  created_at: string
  teacher?: { full_name: string }
}

export interface LearningStory {
  id: string
  child_id: string
  teacher_id: string
  title: string
  ai_draft: string | null
  final_text: string | null
  status: 'draft' | 'review' | 'published'
  created_at: string
}

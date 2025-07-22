export interface User {
  id: number
  username: string
  email: string
  avatar: string
  role_id: number
  role_name: string
  banned: boolean
  created_at: string
  last_login: string | null
}

export interface Course {
  id: number
  name: string
  description?: string
  college_name: string
  college_id: number
}

export interface College {
  id: number
  name: string
  description: string
  course_count: number
  thread_count: number
  post_count: number
  last_activity: string | null
  last_user: string | null
  last_thread: string | null
}

export interface Thread {
  id: number
  title: string
  content: string
  views: number
  closed: boolean
  pinned: boolean
  created_at: string
  updated_at: string
  user_id: number
  username: string
  avatar: string
  user_joined: string
  role_name: string
  course_name: string
  course_id: number
  college_name: string
  college_id: number
  reply_count: number
  last_reply_user?: string
  last_reply_time?: string
}

export interface Reply {
  id: number
  content: string
  created_at: string
  user_id: number
  username: string
  avatar: string
  user_joined: string
  role_name: string
  user_thread_count: number
  user_reply_count: number
  thread_title?: string
  thread_id?: number
  course_name?: string
}

export interface Badge {
  name: string
  icon: string
  description: string
}

export interface UserStats {
  threads_created: number
  replies_made: number
  total_views: number
}

export interface UserProfile {
  user: User
  badges: Badge[]
  courses: Course[]
  stats: UserStats
  recentThreads: Thread[]
  recentReplies: Reply[]
}

export interface DatabaseResult {
  insertId: number
  affectedRows: number
}

export interface CourseEnrollment {
  course_id: number
}

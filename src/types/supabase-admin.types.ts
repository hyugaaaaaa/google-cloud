export type AdminDatabase = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          push_opt_in: boolean
          last_push_reminder_at: string | null
        }
        Insert: {
          id: string
          push_opt_in?: boolean
          last_push_reminder_at?: string | null
        }
        Update: {
          push_opt_in?: boolean
          last_push_reminder_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

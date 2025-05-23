export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          credits_remaining: number
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          credits_remaining?: number
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          credits_remaining?: number
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          input_text: string
          output_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          input_text: string
          output_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          input_text?: string
          output_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          project_id?: string
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string
          credits_used: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          credits_used?: number
          created_at?: string
        }
      }
    }
  }
}
/**
 * Database Types
 * 
 * This file will contain TypeScript types for your database tables.
 * You can generate these automatically using the Supabase CLI:
 * 
 * npx supabase gen types typescript --project-id <project-id> > db/types.ts
 */

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
      // Define your tables here as you create them
      // Example:
      // workspaces: {
      //   Row: {
      //     id: string
      //     name: string
      //     created_at: string
      //     user_id: string
      //   }
      //   Insert: {
      //     id?: string
      //     name: string
      //     created_at?: string
      //     user_id: string
      //   }
      //   Update: {
      //     id?: string
      //     name?: string
      //     created_at?: string
      //     user_id?: string
      //   }
      // }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}


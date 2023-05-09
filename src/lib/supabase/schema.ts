export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Item: {
        Row: {
          by: string
          createdAt: string
          firebaseCreatedAt: string
          firebaseId: number
          id: number
          json: Json | null
          remote: boolean
          storyId: number
          tags: string[]
          text: string
          updatedAt: string
        }
        Insert: {
          by: string
          createdAt?: string
          firebaseCreatedAt: string
          firebaseId: number
          id?: number
          json?: Json | null
          remote?: boolean
          storyId: number
          tags: string[]
          text: string
          updatedAt: string
        }
        Update: {
          by?: string
          createdAt?: string
          firebaseCreatedAt?: string
          firebaseId?: number
          id?: number
          json?: Json | null
          remote?: boolean
          storyId?: number
          tags?: string[]
          text?: string
          updatedAt?: string
        }
      }
      Story: {
        Row: {
          createdAt: string
          firebaseCreatedAt: string
          firebaseId: number
          id: number
          title: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          firebaseCreatedAt: string
          firebaseId: number
          id?: number
          title: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          firebaseCreatedAt?: string
          firebaseId?: number
          id?: number
          title?: string
          updatedAt?: string
        }
      }
      StoryToTags: {
        Row: {
          id: number
          storyId: number
          tags: string[]
        }
        Insert: {
          id?: number
          storyId: number
          tags: string[]
        }
        Update: {
          id?: number
          storyId?: number
          tags?: string[]
        }
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

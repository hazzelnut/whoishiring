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
          fts: unknown | null
          htmlText: string
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
          fts?: unknown | null
          htmlText: string
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
          fts?: unknown | null
          htmlText?: string
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
          count: number
          createdAt: string
          id: number
          storyId: number
          storyToTagId: string
          tag: string
          updatedAt: string
        }
        Insert: {
          count: number
          createdAt?: string
          id?: number
          storyId: number
          storyToTagId: string
          tag: string
          updatedAt: string
        }
        Update: {
          count?: number
          createdAt?: string
          id?: number
          storyId?: number
          storyToTagId?: string
          tag?: string
          updatedAt?: string
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

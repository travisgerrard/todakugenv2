export interface UserPreferences {
  id: string;
  user_id: string;
  wanikani_level: number | null;
  genki_chapter: number | null;
  tadoku_level: number | null;
  created_at: string;
  updated_at: string;
}

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
      profiles: {
        Row: {
          id: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          wanikani_level: number | null;
          genki_chapter: number | null;
          tadoku_level: number | null;
        };
        Insert: {
          id: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          wanikani_level?: number | null;
          genki_chapter?: number | null;
          tadoku_level?: number | null;
        };
        Update: {
          id?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          wanikani_level?: number | null;
          genki_chapter?: number | null;
          tadoku_level?: number | null;
        };
      };
      stories: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          title: string;
          content_jp: string;
          content_en: string;
          vocabulary: {
            word: string;
            reading: string;
            meaning: string;
            example: string;
            example_translation: string;
          }[];
          grammar: {
            pattern: string;
            explanation: string;
            example: string;
            example_translation: string;
          }[];
          quizzes: {
            type: 'vocabulary' | 'grammar' | 'comprehension';
            question: string;
            options: string[];
            correct_answer: number;
            explanation: string;
            related_item?: string;
          }[];
          upvotes: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          title: string;
          content_jp: string;
          content_en: string;
          vocabulary?: {
            word: string;
            reading: string;
            meaning: string;
            example: string;
            example_translation: string;
          }[];
          grammar?: {
            pattern: string;
            explanation: string;
            example: string;
            example_translation: string;
          }[];
          quizzes?: {
            type: 'vocabulary' | 'grammar' | 'comprehension';
            question: string;
            options: string[];
            correct_answer: number;
            explanation: string;
            related_item?: string;
          }[];
          upvotes?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          title?: string;
          content_jp?: string;
          content_en?: string;
          vocabulary?: {
            word: string;
            reading: string;
            meaning: string;
            example: string;
            example_translation: string;
          }[];
          grammar?: {
            pattern: string;
            explanation: string;
            example: string;
            example_translation: string;
          }[];
          quizzes?: {
            type: 'vocabulary' | 'grammar' | 'comprehension';
            question: string;
            options: string[];
            correct_answer: number;
            explanation: string;
            related_item?: string;
          }[];
          upvotes?: number;
        };
      };
      story_upvotes: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          story_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          story_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          story_id?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          created_at: string;
          story_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          story_id: string;
          question: string;
          options: string[];
          correct_answer: number;
          explanation: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          story_id?: string;
          question?: string;
          options?: string[];
          correct_answer?: number;
          explanation?: string;
        };
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 
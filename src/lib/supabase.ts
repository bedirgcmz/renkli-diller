import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (you can generate these from your Supabase schema)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
      };
      sentences: {
        Row: {
          id: string;
          user_id: string | null;
          source_text: string;
          target_text: string;
          keywords: string[];
          category: string;
          status: "new" | "learning" | "learned";
          is_preset: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          source_text: string;
          target_text: string;
          keywords?: string[];
          category?: string;
          status?: "new" | "learning" | "learned";
          is_preset?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          source_text?: string;
          target_text?: string;
          keywords?: string[];
          category?: string;
          status?: "new" | "learning" | "learned";
          is_preset?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: number;
          user_id: string;
          sentence_id: number;
          state: "learning" | "learned";
          learned_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          sentence_id: number;
          state?: "learning" | "learned";
          learned_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          sentence_id?: number;
          state?: "learning" | "learned";
          learned_at?: string | null;
          created_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          sentence_id: string;
          duration_minutes: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sentence_id: string;
          duration_minutes?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sentence_id?: string;
          duration_minutes?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
      quiz_results: {
        Row: {
          id: number;
          user_id: string;
          sentence_id: string | null;
          user_sentence_id: number | null;
          is_correct: boolean;
          quiz_type: "multiple_choice" | "fill_blank";
          answered_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          sentence_id?: string | null;
          user_sentence_id?: number | null;
          is_correct: boolean;
          quiz_type: "multiple_choice" | "fill_blank";
          answered_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          sentence_id?: string | null;
          user_sentence_id?: number | null;
          is_correct?: boolean;
          quiz_type?: "multiple_choice" | "fill_blank";
          answered_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          ui_language: string;
          target_language: string;
          theme: "light" | "dark";
          daily_goal: number;
          notifications: boolean;
          reminder_time: string;
          auto_mode_speed: number;
          show_translations: boolean;
          tts_enabled: boolean;
          tts_voice: string;
          achievement_unlocked_ids: string[];
          achievement_unlocked_dates: Record<string, string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ui_language?: string;
          target_language?: string;
          theme?: "light" | "dark";
          daily_goal?: number;
          notifications?: boolean;
          reminder_time?: string;
          auto_mode_speed?: number;
          show_translations?: boolean;
          tts_enabled?: boolean;
          tts_voice?: string;
          achievement_unlocked_ids?: string[];
          achievement_unlocked_dates?: Record<string, string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ui_language?: string;
          target_language?: string;
          theme?: "light" | "dark";
          daily_goal?: number;
          notifications?: boolean;
          reminder_time?: string;
          auto_mode_speed?: number;
          show_translations?: boolean;
          tts_enabled?: boolean;
          tts_voice?: string;
          achievement_unlocked_ids?: string[];
          achievement_unlocked_dates?: Record<string, string>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

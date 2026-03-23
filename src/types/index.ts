// Language types
export type SupportedLanguage = "tr" | "en" | "sv" | "de" | "es" | "fr" | "pt";

// Sentence types
export type SentenceStatus = "new" | "learning" | "learned";

export type SentenceCategory =
  | "daily_conversation"
  | "business_english"
  | "phrasal_verbs"
  | "travel"
  | "academic"
  | "idioms"
  | "grammar_patterns"
  | "technology"
  | "health"
  | "social_modern";

export interface Sentence {
  id: string;
  user_id?: string;
  source_text: string;
  target_text: string;
  keywords: string[];
  category_id?: number;
  category_name?: string;
  status: SentenceStatus;
  is_preset: boolean;
  source_lang?: SupportedLanguage;
  target_lang?: SupportedLanguage;
  created_at?: string;
  updated_at?: string;
}

// Progress types
export interface UserProgress {
  id: string;
  user_id: string;
  sentence_id: string;
  correct: boolean;
  state?: "learning" | "learned";
  learned_at?: string | null;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  sentence_id: string;
  duration_minutes: number;
  completed: boolean;
  created_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  sentence_id: string;
  is_correct: boolean;
  quiz_type: "multiple_choice" | "fill_blank";
  answered_at: string;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  sentence: Sentence;
  type: "multiple_choice" | "fill_blank";
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation?: string;
}

// Settings types
export interface UserSettings {
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  theme: "light" | "dark";
  dailyGoal: number;
  notifications: boolean;
  reminderTime: string;
  autoModeSpeed: number;
  showTranslations: boolean;
  ttsEnabled: boolean;
  ttsVoice: string;
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  AuthFlow: undefined;
  Main: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Learn: { initialTab?: "study" | "listening" } | undefined;
  Quiz: undefined;
  Reading: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  AddSentence: undefined;
  EditSentence: { sentenceId: string; isPreset: boolean };
  Settings: undefined;
  Paywall: undefined;
  CategoryBrowser: undefined;
  AutoMode: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
  LearnedSentences: undefined;
};

export type AuthStackParamList = {
  Auth: undefined;
  ResetPassword: undefined;
};

export type TabParamList = {
  Home: undefined;
  Sentences: undefined;
  Me: undefined;
  More: undefined;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface AddSentenceForm {
  source_text: string;
  target_text: string;
  keywords: string[];
  category_id?: number;
}

// Theme types
export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  cardBackground: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  statusLearning: string;
  statusNew: string;
  statusUnlearned: string;
  premiumAccent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  borderLight: string;
  divider: string;
  surface: string;
  surfaceSecondary: string;
  keyword: string;
  keywordBg: string;
}

// Reading Text types
export interface ReadingTextKeyword {
  id: string;
  reading_text_id: string;
  position_index: number;
  color_index: number;
  keyword_tr: string | null;
  keyword_en: string | null;
  keyword_sv: string | null;
  keyword_de: string | null;
  keyword_es: string | null;
  keyword_fr: string | null;
  keyword_pt: string | null;
}

export interface ReadingText {
  id: string;
  slug: string;
  category: string;
  difficulty: 1 | 2 | 3;
  is_premium: boolean;
  order_index: number;
  estimated_reading_seconds: number | null;
  title_tr: string | null;
  title_en: string | null;
  title_sv: string | null;
  title_de: string | null;
  title_es: string | null;
  title_fr: string | null;
  title_pt: string | null;
  body_tr: string | null;
  body_en: string | null;
  body_sv: string | null;
  body_de: string | null;
  body_es: string | null;
  body_fr: string | null;
  body_pt: string | null;
  keywords?: ReadingTextKeyword[];
  created_at: string;
}

export interface UserReadingProgress {
  id: string;
  user_id: string;
  reading_text_id: string;
  status: "read" | "learned";
  completed_at: string;
}

// Legacy types (for backward compatibility)
export type SentenceState = SentenceStatus;

export interface PillSegment {
  text: string;
  isPill: boolean;
  pillIndex: number | null;
}

export interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_sv: string;
  name_de: string;
  name_es: string;
  name_fr: string;
  name_pt: string;
  icon: string;
  sort_order: number;
  is_free: boolean;
}

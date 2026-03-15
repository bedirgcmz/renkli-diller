// Language types
export type SupportedLanguage = 'tr' | 'en' | 'sv' | 'de';

// Sentence types
export type SentenceStatus = 'new' | 'learning' | 'learned';

export type SentenceCategory =
  | 'daily_conversation'
  | 'business_english'
  | 'phrasal_verbs'
  | 'travel'
  | 'academic'
  | 'idioms'
  | 'grammar_patterns'
  | 'technology'
  | 'health'
  | 'social_modern';

export interface Sentence {
  id: string;
  user_id?: string;
  source_text: string;
  target_text: string;
  keywords: string[];
  category: SentenceCategory;
  status: SentenceStatus;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
}

// Progress types
export interface UserProgress {
  id: string;
  user_id: string;
  sentence_id: string;
  correct: boolean;
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
  correct: boolean;
  question_type: 'multiple_choice' | 'fill_blank';
  created_at: string;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  sentence: Sentence;
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation?: string;
}

// Settings types
export interface UserSettings {
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  theme: 'light' | 'dark';
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
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
  LanguageSelection: undefined;
};

export type TabParamList = {
  Learn: undefined;
  Quiz: undefined;
  Sentences: undefined;
  Profile: undefined;
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
  category: SentenceCategory;
}

// Theme types
export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
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

// Legacy types (for backward compatibility)
export type SentenceState = SentenceStatus;
export type KeywordMarker = '*' | '#' | '%' | '@' | '+' | '&' | '{' | '~';

export interface KeywordColor {
  marker: KeywordMarker;
  color: string;
  name: string;
}

export interface TextSegment {
  text: string;
  color: string | null;
  isItalic?: boolean;
}

export interface Category {
  id: number;
  name_tr: string;
  name_en: string;
  name_sv: string;
  name_de: string;
  icon: string;
  sort_order: number;
  is_free: boolean;
}
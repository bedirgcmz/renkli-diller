// Project-wide TypeScript types for Renkli Diller

// Desteklenen diller
export type SupportedLanguage = 'tr' | 'en' | 'sv' | 'de';

// Cümle durumu
export type SentenceState = 'learning' | 'learned';

// Keyword renklendirme işaretçileri
export type KeywordMarker = '*' | '#' | '%' | '@' | '+' | '&' | '{' | '~';

// Keyword renk haritası
export interface KeywordColor {
  marker: KeywordMarker;
  color: string; // hex
  name: string;
}

// Keyword renklendirme sonucu (parse edilmiş segment)
export interface TextSegment {
  text: string;
  color: string | null; // null = normal metin
  isItalic?: boolean; // @ işaretçisi için
}

// Kategori
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

// Hazır cümle (DB'den gelen, 4 dilde)
export interface Sentence {
  id: number;
  category_id: number;
  text_tr: string;
  text_en: string;
  text_sv: string;
  text_de: string;
  keywords_tr: string[]; // keyword işaretçili raw text parçaları
  keywords_en: string[];
  keywords_sv: string[];
  keywords_de: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_free: boolean;
  sort_order: number;
}

// Kullanıcının eklediği cümle
export interface UserSentence {
  id: number;
  user_id: string;
  category_id: number | null;
  source_text: string; // arayüz dilindeki cümle (keyword işaretçili)
  target_text: string; // hedef dildeki cümle (keyword işaretçili)
  keywords: string[];
  state: SentenceState;
  created_at: string;
}

// Kullanıcı ilerleme kaydı (hazır cümleler için)
export interface UserProgress {
  id: number;
  user_id: string;
  sentence_id: number;
  state: SentenceState;
  learned_at: string | null;
  created_at: string;
}

// Günlük istatistik
export interface DailyStat {
  id: number;
  user_id: string;
  date: string;
  sentences_studied: number;
  sentences_learned: number;
  quiz_correct: number;
  quiz_total: number;
}

// Quiz sonucu
export interface QuizResult {
  id: number;
  user_id: string;
  sentence_id: number | null;
  user_sentence_id: number | null;
  quiz_type: 'multiple_choice' | 'fill_blank';
  is_correct: boolean;
  answered_at: string;
}

// Quiz sorusu (runtime)
export interface QuizQuestion {
  type: 'multiple_choice' | 'fill_blank';
  sentence: Sentence | UserSentence;
  sourceText: string; // gösterilecek cümle
  correctAnswer: string; // doğru cevap
  options?: string[]; // çoktan seçmeli şıklar (4 adet)
  blankWord?: string; // boşluk doldurma için doğru kelime
  hintLetters?: string; // ipucu harfleri
}

// Kullanıcı profili
export interface UserProfile {
  id: string;
  display_name: string;
  ui_language: SupportedLanguage;
  target_language: SupportedLanguage;
  is_premium: boolean;
  theme: 'light' | 'dark';
  daily_goal: 5 | 10 | 20 | 30;
  streak_count: number;
  last_active: string;
  created_at: string;
}

// Auto Mode ayarları
export interface AutoModeSettings {
  speed: 0.5 | 1 | 1.5 | 2; // hız çarpanı
  isPlaying: boolean;
  currentIndex: number;
  showTarget: boolean; // hedef dil gösterildi mi
}

// Dinamik bekleme formülü
// bekleme_ms = max(2000, karakter_sayısı * 100) / speed
export type CalculateDelay = (text: string, speed: number) => number;

// Tema renkleri
export interface ThemeColors {
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  statusLearning: string;
  statusNew: string;
  statusUnlearned: string;
  premiumAccent: string;
}

// Navigation param tipleri
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AutoMode: undefined;
  AddSentence: undefined;
  EditSentence: { sentenceId: number; isUserSentence: boolean };
  Settings: undefined;
  Paywall: undefined;
  CategoryBrowser: undefined;
  PDFExport: undefined;
};

export type TabParamList = {
  Learn: undefined;
  Quiz: undefined;
  Sentences: undefined;
  Profile: undefined;
};

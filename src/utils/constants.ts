import { SentenceTag, SupportedLanguage } from '@/types';

export const PILL_COLORS = {
  light: [
    { bg: '#FF6B6B', text: '#FFFFFF' },
    { bg: '#FF9F43', text: '#FFFFFF' },
    { bg: '#FECA57', text: '#333333' },
    { bg: '#2ED573', text: '#FFFFFF' },
    { bg: '#1DD1A1', text: '#FFFFFF' },
    { bg: '#54A0FF', text: '#FFFFFF' },
    { bg: '#8B5CF6', text: '#FFFFFF' },
    { bg: '#FF6B81', text: '#FFFFFF' },
    { bg: '#A29BFE', text: '#FFFFFF' },
    { bg: '#0ABDE3', text: '#FFFFFF' },
  ],
  dark: [
    { bg: '#C0392B', text: '#FFFFFF' },
    { bg: '#D35400', text: '#FFFFFF' },
    { bg: '#B7950B', text: '#FFFFFF' },
    { bg: '#1E8449', text: '#FFFFFF' },
    { bg: '#148F77', text: '#FFFFFF' },
    { bg: '#2E86C1', text: '#FFFFFF' },
    { bg: '#6C3483', text: '#FFFFFF' },
    { bg: '#C0392B', text: '#FFFFFF' },
    { bg: '#6C5CE7', text: '#FFFFFF' },
    { bg: '#1A5276', text: '#FFFFFF' },
  ],
};

// Keyword text colors — no background, color applied to the word itself
export const KEYWORD_TEXT_COLORS = {
  // Bright colors for dark backgrounds
  dark: [
    '#FF6B6B', // Coral
    '#FFA94D', // Orange
    '#FFD43B', // Yellow
    '#69DB7C', // Green
    '#38D9A9', // Teal
    '#74C0FC', // Blue
    '#B197FC', // Lavender
    '#F783AC', // Pink
    '#4FCBEA', // Cyan
    '#A9E34B', // Lime
  ],
  // Deep colors for light backgrounds
  light: [
    '#E03131', // Red
    '#D9480F', // Orange
    '#B08600', // Amber
    '#2F9E44', // Green
    '#0C8599', // Teal
    '#1971C2', // Blue
    '#6741D9', // Violet
    '#C2255C', // Pink
    '#0B7285', // Cyan
    '#5C940D', // Lime
  ],
};

export const FREE_USER_SENTENCE_LIMIT = 30;
export const FREE_QUIZ_DAILY_LIMIT = 5;
export const FREE_AUTO_MODE_LIMIT = 10;
export const PREMIUM_PRICE_MONTHLY = '€3.99';
export const PREMIUM_PRICE_ANNUAL = '€19.99';

export const MIN_DELAY_MS = 2000;
export const DELAY_PER_CHAR_MS = 100;
export const POST_READ_DELAY_MS = 2000;

export const QUIZ_CORRECT_COLOR = "#2ECC71";
export const QUIZ_WRONG_COLOR = "#E53E3E";

export const LANG_CODE: Record<SupportedLanguage, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
};

export const TAG_OPTIONS: { value: SentenceTag; i18nKey: string; icon: string }[] = [
  { value: "this_week",  i18nKey: "tags.this_week",  icon: "calendar-outline" },
  { value: "this_month", i18nKey: "tags.this_month", icon: "calendar-clear-outline" },
  { value: "work",       i18nKey: "tags.work",       icon: "briefcase-outline" },
  { value: "school",     i18nKey: "tags.school",     icon: "school-outline" },
  { value: "home",       i18nKey: "tags.home",       icon: "home-outline" },
  { value: "travel",     i18nKey: "tags.travel",     icon: "airplane-outline" },
  { value: "shopping",   i18nKey: "tags.shopping",   icon: "cart-outline" },
  { value: "social",     i18nKey: "tags.social",     icon: "people-outline" },
  { value: "health",     i18nKey: "tags.health",     icon: "heart-outline" },
  { value: "food",       i18nKey: "tags.food",       icon: "restaurant-outline" },
  { value: "easy",       i18nKey: "tags.easy",       icon: "sunny-outline" },
  { value: "hard",       i18nKey: "tags.hard",       icon: "barbell-outline" },
  { value: "important",  i18nKey: "tags.important",  icon: "star-outline" },
];

export const TAG_GROUPS: { labelKey: string; tags: SentenceTag[] }[] = [
  {
    labelKey: "tags.group_time",
    tags: ["this_week", "this_month"],
  },
  {
    labelKey: "tags.group_topic",
    tags: ["work", "school", "home", "travel", "shopping", "social", "health", "food"],
  },
  {
    labelKey: "tags.group_difficulty",
    tags: ["easy", "hard", "important"],
  },
];

export const APP_NAMES: Record<SupportedLanguage, string> = {
  tr: 'Parlio',
  en: 'Parlio',
  sv: 'Parlio',
  de: 'Parlio',
  es: 'Parlio',
  fr: 'Parlio',
  pt: 'Parlio',
};

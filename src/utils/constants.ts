import { SupportedLanguage } from '@/types';

export const PILL_COLORS = {
  light: [
    { bg: '#FF6B6B', text: '#FFFFFF' }, // Mercan
    { bg: '#FF9F43', text: '#FFFFFF' }, // Turuncu
    { bg: '#FECA57', text: '#333333' }, // Altın (koyu text — sarı bg'de beyaz okunmaz)
    { bg: '#2ED573', text: '#FFFFFF' }, // Zümrüt
    { bg: '#1DD1A1', text: '#FFFFFF' }, // Turkuaz
    { bg: '#54A0FF', text: '#FFFFFF' }, // Gök Mavi
    { bg: '#8B5CF6', text: '#FFFFFF' }, // Mor
    { bg: '#FF6B81', text: '#FFFFFF' }, // Pembe
    { bg: '#A29BFE', text: '#FFFFFF' }, // Lavanta
    { bg: '#0ABDE3', text: '#FFFFFF' }, // Okyanus
  ],
  dark: [
    { bg: '#C0392B', text: '#FFFFFF' }, // Mercan
    { bg: '#D35400', text: '#FFFFFF' }, // Turuncu
    { bg: '#B7950B', text: '#FFFFFF' }, // Altın
    { bg: '#1E8449', text: '#FFFFFF' }, // Zümrüt
    { bg: '#148F77', text: '#FFFFFF' }, // Turkuaz
    { bg: '#2E86C1', text: '#FFFFFF' }, // Gök Mavi
    { bg: '#6C3483', text: '#FFFFFF' }, // Mor
    { bg: '#C0392B', text: '#FFFFFF' }, // Pembe
    { bg: '#6C5CE7', text: '#FFFFFF' }, // Lavanta
    { bg: '#1A5276', text: '#FFFFFF' }, // Okyanus
  ],
};

export const FREE_SENTENCE_LIMIT = 30;
export const FREE_USER_SENTENCE_LIMIT = 30;
export const FREE_QUIZ_DAILY_LIMIT = 5;
export const FREE_AUTO_MODE_LIMIT = 10;
export const FREE_CATEGORY_COUNT = 2;
export const PREMIUM_PRICE_MONTHLY = '$2.99';
export const PREMIUM_PRICE_ANNUAL = '$16.99';
export const PREMIUM_PRICE_LIFETIME = '$24.99';

export const MIN_DELAY_MS = 2000;
export const DELAY_PER_CHAR_MS = 100;
export const POST_READ_DELAY_MS = 2000;

export const APP_NAMES: Record<SupportedLanguage, string> = {
  tr: 'Renkli Diller',
  en: 'Colorful Languages',
  sv: 'Färgglada Språk',
  de: 'Bunte Sprachen'
};

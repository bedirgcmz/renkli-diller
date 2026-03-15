import { KeywordColor, SupportedLanguage } from '@/types';

export const KEYWORD_COLORS: KeywordColor[] = [
  { marker: '*', color: '#E53E3E', name: 'Red' },
  { marker: '#', color: '#38A169', name: 'Green' },
  { marker: '%', color: '#D69E2E', name: 'Yellow' },
  { marker: '@', color: '#718096', name: 'GrayGreen' },
  { marker: '+', color: '#DD6B20', name: 'Orange' },
  { marker: '&', color: '#805AD5', name: 'Purple' },
  { marker: '{', color: '#A0AEC0', name: 'Gray' },
  { marker: '~', color: '#3182CE', name: 'Blue' }
];

export const FREE_SENTENCE_LIMIT = 30;
export const FREE_USER_SENTENCE_LIMIT = 30;
export const FREE_QUIZ_DAILY_LIMIT = 5;
export const FREE_AUTO_MODE_LIMIT = 10;
export const FREE_CATEGORY_COUNT = 2;
export const PREMIUM_PRICE = '$14.99';

export const MIN_DELAY_MS = 2000;
export const DELAY_PER_CHAR_MS = 100;
export const POST_READ_DELAY_MS = 2000;

export const APP_NAMES: Record<SupportedLanguage, string> = {
  tr: 'Renkli Diller',
  en: 'Colorful Languages',
  sv: 'Färgglada Språk',
  de: 'Bunte Sprachen'
};

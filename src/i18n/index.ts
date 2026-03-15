import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import tr from './tr.json';
import sv from './sv.json';
import de from './de.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    sv: { translation: sv },
    de: { translation: de }
  },
  lng: 'tr',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;

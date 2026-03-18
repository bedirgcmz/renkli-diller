import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./en.json";
import tr from "./tr.json";
import sv from "./sv.json";
import de from "./de.json";
import es from "./es.json";
import fr from "./fr.json";
import pt from "./pt.json";
import { SupportedLanguage } from "@/types";

const LANGUAGE_KEY = "@language";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    sv: { translation: sv },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
    pt: { translation: pt },
  },
  lng: "tr",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
});

// Dil değişikliği fonksiyonu
export const changeLanguage = async (lang: SupportedLanguage) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error("Language change error:", error);
  }
};

// Kaydedilmiş dili yükle
export const loadSavedLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLang && ["tr", "en", "sv", "de", "es", "fr", "pt"].includes(savedLang)) {
      await i18n.changeLanguage(savedLang);
    }
  } catch (error) {
    console.error("Load saved language error:", error);
  }
};

export default i18n;

import React, { createContext, useContext, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useSettingsStore } from '@/store/useSettingsStore';

interface I18nContextType {
  changeLanguage: (language: string) => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { uiLanguage, setUILanguage } = useSettingsStore();

  useEffect(() => {
    // Initialize i18n with saved language
    const initializeI18n = async () => {
      await i18n.init();
      if (uiLanguage && uiLanguage !== i18n.language) {
        await i18n.changeLanguage(uiLanguage);
      }
    };

    initializeI18n();
  }, []);

  useEffect(() => {
    // Update i18n when uiLanguage changes
    if (uiLanguage && uiLanguage !== i18n.language) {
      i18n.changeLanguage(uiLanguage);
    }
  }, [uiLanguage]);

  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    setUILanguage(language as any);
  };

  const value = {
    changeLanguage,
  };

  return (
    <I18nContext.Provider value={value}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </I18nContext.Provider>
  );
};
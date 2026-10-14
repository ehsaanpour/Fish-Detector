import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLocale, translations } from './translations';

interface LocaleContextType {
  locale: SupportedLocale;
  isRTL: boolean;
  t: typeof translations.en;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  toggleLocale: () => Promise<void>;
  formatNumber: (num: number | string) => string;
  formatCurrency: (amount: number, currency: 'toman' | 'usd') => string;
}

const LOCALE_STORAGE_KEY = '@fish_inspector_locale';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const toPersianDigits = (input: string | number): string => {
  return String(input).replace(/[0-9]/g, (w) => persianDigits[+w]);
};

const LocaleContext = createContext<LocaleContextType>({
  locale: 'fa',
  isRTL: true,
  t: translations.fa,
  setLocale: async () => {},
  toggleLocale: async () => {},
  formatNumber: (num) => String(num),
  formatCurrency: (amount, currency) => `${amount} ${currency}`,
});

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('fa');

  useEffect(() => {
    (async () => {
      try {
        const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (savedLocale === 'en' || savedLocale === 'fa') {
          setLocaleState(savedLocale);
        }
      } catch {
        // Fallback to default
      }
    })();
  }, []);

  const setLocale = async (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleLocale = async () => {
    const nextLocale: SupportedLocale = locale === 'fa' ? 'en' : 'fa';
    await setLocale(nextLocale);
  };

  const isRTL = locale === 'fa';
  const t = translations[locale];

  const formatNumber = (num: number | string): string => {
    if (num === null || num === undefined) return '';
    const formatted = typeof num === 'number' ? num.toLocaleString('en-US') : num;
    return isRTL ? toPersianDigits(formatted) : formatted;
  };

  const formatCurrency = (amount: number, currency: 'toman' | 'usd'): string => {
    const formattedNum = formatNumber(amount);
    if (currency === 'usd') {
      return `$${formattedNum}`;
    }
    return isRTL ? `${formattedNum} تومان` : `${formattedNum} Toman`;
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        isRTL,
        t,
        setLocale,
        toggleLocale,
        formatNumber,
        formatCurrency,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useAppLocale = () => useContext(LocaleContext);

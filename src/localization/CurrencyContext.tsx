import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyType = 'toman' | 'usd';

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => Promise<void>;
  toggleCurrency: () => Promise<void>;
  priceOverrides: Record<string, number>; // fish_id -> toman price
  updateCustomPrice: (fishId: string, priceToman: number) => Promise<void>;
  getPriceForFish: (fishId: string, defaultToman: number, defaultUsd: number) => {
    price: number;
    displayUnit: string;
    isCustom: boolean;
  };
}

const CURRENCY_STORAGE_KEY = '@fish_inspector_currency';
const PRICE_OVERRIDES_KEY = '@fish_inspector_price_overrides';

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'toman',
  setCurrency: async () => {},
  toggleCurrency: async () => {},
  priceOverrides: {},
  updateCustomPrice: async () => {},
  getPriceForFish: () => ({ price: 0, displayUnit: '', isCustom: false }),
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>('toman');
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem(CURRENCY_STORAGE_KEY);
        if (savedCurrency === 'toman' || savedCurrency === 'usd') {
          setCurrencyState(savedCurrency);
        }
        const savedOverrides = await AsyncStorage.getItem(PRICE_OVERRIDES_KEY);
        if (savedOverrides) {
          setPriceOverrides(JSON.parse(savedOverrides));
        }
      } catch {
        // Ignore read errors
      }
    })();
  }, []);

  const setCurrency = async (newCurrency: CurrencyType) => {
    setCurrencyState(newCurrency);
    try {
      await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch {
      // Ignore write errors
    }
  };

  const toggleCurrency = async () => {
    const next = currency === 'toman' ? 'usd' : 'toman';
    await setCurrency(next);
  };

  const updateCustomPrice = async (fishId: string, priceToman: number) => {
    const updated = { ...priceOverrides, [fishId]: priceToman };
    setPriceOverrides(updated);
    try {
      await AsyncStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const getPriceForFish = (fishId: string, defaultToman: number, defaultUsd: number) => {
    const customToman = priceOverrides[fishId];
    const isCustom = customToman !== undefined;
    const finalToman = isCustom ? customToman : defaultToman;

    if (currency === 'usd') {
      // If user overrode in Toman, calculate USD equivalent (~$1 ≈ 85,000 Toman)
      const usdValue = isCustom ? Math.round((finalToman / 85000) * 10) / 10 : defaultUsd;
      return {
        price: usdValue,
        displayUnit: 'USD/kg',
        isCustom,
      };
    }

    return {
      price: finalToman,
      displayUnit: 'تومان/کیلو',
      isCustom,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        priceOverrides,
        updateCustomPrice,
        getPriceForFish,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useAppCurrency = () => useContext(CurrencyContext);

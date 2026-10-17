import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FishSpecies } from '../database/schema';
import { GeminiPricingService, AiFishPrice } from '../engine/ai/geminiPricingService';

export type CurrencyType = 'toman' | 'usd';

export interface FishPriceInfo {
  price: number;
  priceToman: number;
  priceUsd: number;
  displayUnit: string;
  isCustom: boolean;
  isAi: boolean;
  minPriceToman?: number;
  maxPriceToman?: number;
  marketNotesFa?: string;
  marketNotesEn?: string;
  lastUpdated?: number;
}

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => Promise<void>;
  toggleCurrency: () => Promise<void>;
  priceOverrides: Record<string, number>; // fish_id -> toman price
  aiPrices: Record<string, AiFishPrice>;
  isRefreshingAiPrice: boolean;
  updateCustomPrice: (fishId: string, priceToman: number) => Promise<void>;
  clearCustomPrice: (fishId: string) => Promise<void>;
  refreshAiPriceForFish: (fish: FishSpecies) => Promise<AiFishPrice | null>;
  refreshAllAiPrices: (speciesList: FishSpecies[]) => Promise<void>;
  getPriceForFish: (fishId: string, defaultToman: number, defaultUsd: number) => FishPriceInfo;
}

const CURRENCY_STORAGE_KEY = '@fish_inspector_currency';
const PRICE_OVERRIDES_KEY = '@fish_inspector_price_overrides';

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'toman',
  setCurrency: async () => {},
  toggleCurrency: async () => {},
  priceOverrides: {},
  aiPrices: {},
  isRefreshingAiPrice: false,
  updateCustomPrice: async () => {},
  clearCustomPrice: async () => {},
  refreshAiPriceForFish: async () => null,
  refreshAllAiPrices: async () => {},
  getPriceForFish: () => ({
    price: 0,
    priceToman: 0,
    priceUsd: 0,
    displayUnit: '',
    isCustom: false,
    isAi: false,
  }),
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>('toman');
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [aiPrices, setAiPrices] = useState<Record<string, AiFishPrice>>({});
  const [isRefreshingAiPrice, setIsRefreshingAiPrice] = useState(false);

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

      // Load AI market prices
      const cachedAi = await GeminiPricingService.getAllCachedPrices();
      setAiPrices(cachedAi);
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

  const clearCustomPrice = async (fishId: string) => {
    const updated = { ...priceOverrides };
    delete updated[fishId];
    setPriceOverrides(updated);
    try {
      await AsyncStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const refreshAiPriceForFish = useCallback(async (fish: FishSpecies): Promise<AiFishPrice | null> => {
    setIsRefreshingAiPrice(true);
    try {
      const updated = await GeminiPricingService.fetchPriceWithAi(fish);
      if (updated) {
        setAiPrices((prev) => ({ ...prev, [fish.id]: updated }));
        return updated;
      }
    } catch {
      // Ignore refresh error
    } finally {
      setIsRefreshingAiPrice(false);
    }
    return null;
  }, []);

  const refreshAllAiPrices = useCallback(async (speciesList: FishSpecies[]): Promise<void> => {
    setIsRefreshingAiPrice(true);
    try {
      const updated = await GeminiPricingService.fetchBatchPricesWithAi(speciesList);
      setAiPrices(updated);
    } catch {
      // Ignore error
    } finally {
      setIsRefreshingAiPrice(false);
    }
  }, []);

  const getPriceForFish = useCallback(
    (fishId: string, defaultToman: number, defaultUsd: number): FishPriceInfo => {
      const customToman = priceOverrides[fishId];
      const isCustom = customToman !== undefined;

      // Prioritize: 1. User manual override -> 2. Gemini AI market rate -> 3. Local fallback default
      const aiData = aiPrices[fishId];
      const isAi = !isCustom && aiData !== undefined;

      const effectiveToman = isCustom
        ? customToman
        : aiData
        ? aiData.pricePerKgToman
        : defaultToman;

      const effectiveUsd = isCustom
        ? Math.round((customToman / 85000) * 10) / 10
        : aiData
        ? aiData.pricePerKgUsd
        : defaultUsd;

      const displayPrice = currency === 'usd' ? effectiveUsd : effectiveToman;
      const displayUnit = currency === 'usd' ? 'USD/kg' : 'تومان/کیلو';

      return {
        price: displayPrice,
        priceToman: effectiveToman,
        priceUsd: effectiveUsd,
        displayUnit,
        isCustom,
        isAi,
        minPriceToman: aiData?.minPriceToman,
        maxPriceToman: aiData?.maxPriceToman,
        marketNotesFa: aiData?.marketNotesFa,
        marketNotesEn: aiData?.marketNotesEn,
        lastUpdated: aiData?.lastUpdated,
      };
    },
    [currency, priceOverrides, aiPrices]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        priceOverrides,
        aiPrices,
        isRefreshingAiPrice,
        updateCustomPrice,
        clearCustomPrice,
        refreshAiPriceForFish,
        refreshAllAiPrices,
        getPriceForFish,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useAppCurrency = () => useContext(CurrencyContext);

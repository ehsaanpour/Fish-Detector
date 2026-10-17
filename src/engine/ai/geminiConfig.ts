import AsyncStorage from '@react-native-async-storage/async-storage';

export const GEMINI_STORAGE_KEY = '@fish_inspector_gemini_api_key';

export const GEMINI_FLASH_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-flash-latest',
];

/**
 * Retrieves the stored Gemini API key, checking AsyncStorage first, then environment variable.
 */
export async function getGeminiApiKey(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(GEMINI_STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();
  } catch {
    // Ignore storage read error
  }

  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.EXPO_PUBLIC_GEMINI_API_KEY
  ) {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim();
  }

  return null;
}

/**
 * Saves the Gemini API key to local persistent storage.
 */
export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    await AsyncStorage.removeItem(GEMINI_STORAGE_KEY);
  } else {
    await AsyncStorage.setItem(GEMINI_STORAGE_KEY, trimmed);
  }
}

/**
 * Checks whether a valid Gemini API key is configured.
 */
export async function isGeminiConfigured(): Promise<boolean> {
  const key = await getGeminiApiKey();
  return Boolean(key && key.length > 5);
}

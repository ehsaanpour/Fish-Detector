import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_FISH_SPECIES } from '../../database/seedData';
import { FishSpecies } from '../../database/schema';
import { InspectionPrediction } from '../cv/speciesClassifier';
import { FreshnessInput } from '../freshnessGrader';

const GEMINI_STORAGE_KEY = '@fish_inspector_gemini_api_key';

export interface GeminiClassificationResult {
  speciesId: string;
  confidence: number;
  distinguishingFeaturesFa: string[];
  distinguishingFeaturesEn: string[];
  freshness: {
    eyeState: 'prime' | 'good' | 'poor';
    gillState: 'prime' | 'good' | 'poor';
    skinState: 'prime' | 'good' | 'poor';
    fleshState: 'prime' | 'good' | 'poor';
  };
  alternatives?: {
    speciesId: string;
    confidence: number;
  }[];
}

export class GeminiVisionService {
  /**
   * Retrieves the stored Gemini API key, checking AsyncStorage first, then environment variable.
   */
  static async getApiKey(): Promise<string | null> {
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
  static async saveApiKey(apiKey: string): Promise<void> {
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
  static async isConfigured(): Promise<boolean> {
    const key = await this.getApiKey();
    return !!key && key.length > 10;
  }

  /**
   * Identifies the fish species using Google Gemini Vision API.
   * Sends the base64-encoded image and matches against the 46 catalog species.
   */
  static async classifyFishWithGemini(
    base64Data: string,
    mimeType: string = 'image/jpeg'
  ): Promise<InspectionPrediction | null> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return null;

    // Compact species summary for Gemini prompt context
    const catalogSummary = ALL_FISH_SPECIES.map((f) => ({
      id: f.id,
      nameEn: f.nameEn,
      nameFa: f.nameFa,
      scientific: f.scientificName,
      dialects: f.regionalNames?.map((r) => r.dialectName).join(', ') || '',
    }));

    const systemPrompt = `You are a world-class marine ichthyologist and expert Persian Gulf / Caspian Sea fisheries inspector.
Examine this fish image closely and identify the exact commercial fish species.

IMPORTANT: Match the fish to ONE of the following 46 known catalog species:
${JSON.stringify(catalogSummary, null, 1)}

You must return ONLY a valid JSON object with the following schema:
{
  "speciesId": "<exact id matching one of the 46 species above>",
  "confidence": <integer percentage 80-99>,
  "distinguishingFeaturesFa": ["نکته بارز فیزیکی ۱", "نکته بارز ۲", "نکته بارز ۳"],
  "distinguishingFeaturesEn": ["Physical feature 1", "Physical feature 2", "Physical feature 3"],
  "freshness": {
    "eyeState": "prime" | "good" | "poor",
    "gillState": "prime" | "good" | "poor",
    "skinState": "prime" | "good" | "poor",
    "fleshState": "prime" | "good" | "poor"
  },
  "alternatives": [
    { "speciesId": "<alternative id 1>", "confidence": <integer> },
    { "speciesId": "<alternative id 2>", "confidence": <integer> }
  ]
}

If the image clearly depicts a Great Barracuda / Sphyraena (ماهی دولمی / کوتر), the speciesId is "dolmi".
If it is a Silver Pomfret / Pampus argenteus (حلوا سفید / زبیدی), the speciesId is "zobaidi".
If it is a Spanish Mackerel / Scomberomorus commerson (ماهی شیر), the speciesId is "shir".
If it is King Mackerel / Scomberomorus guttatus (ماهی قباد), the speciesId is "ghobad".
If it is Orange-spotted Grouper (هامور), the speciesId is "hamour".
Do not output Markdown backticks or any preamble, output raw JSON only.`;

    // Try modern Gemini models: gemini-2.5-flash first, fallback to gemini-1.5-flash
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const payload = {
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            response_mime_type: 'application/json',
          },
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const textContent =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (!textContent) continue;

        // Clean any code block fencing if present
        const cleanedJson = textContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        const parsed: GeminiClassificationResult = JSON.parse(cleanedJson);

        const matchedSpecies =
          ALL_FISH_SPECIES.find((f) => f.id === parsed.speciesId) ||
          ALL_FISH_SPECIES.find(
            (f) => f.slug.includes(parsed.speciesId) || parsed.speciesId.includes(f.id)
          );

        if (!matchedSpecies) continue;

        // Build alternatives
        const alternatives: {
          species: FishSpecies;
          confidence: number;
          distinguishingFeaturesEn: string[];
          distinguishingFeaturesFa: string[];
        }[] = [];

        if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
          for (const alt of parsed.alternatives) {
            const altSpecies = ALL_FISH_SPECIES.find((f) => f.id === alt.speciesId);
            if (altSpecies && altSpecies.id !== matchedSpecies.id) {
              alternatives.push({
                species: altSpecies,
                confidence: alt.confidence || 45,
                distinguishingFeaturesEn: altSpecies.physicalFeaturesEn,
                distinguishingFeaturesFa: altSpecies.physicalFeaturesFa,
              });
            }
          }
        }

        // Fill remaining alternatives if fewer than 2
        while (alternatives.length < 2) {
          const fallback = ALL_FISH_SPECIES.find(
            (f) =>
              f.id !== matchedSpecies.id &&
              !alternatives.some((a) => a.species.id === f.id)
          );
          if (fallback) {
            alternatives.push({
              species: fallback,
              confidence: Math.max(35, Math.floor(parsed.confidence * 0.5)),
              distinguishingFeaturesEn: fallback.physicalFeaturesEn,
              distinguishingFeaturesFa: fallback.physicalFeaturesFa,
            });
          } else {
            break;
          }
        }

        const freshnessEstimate: FreshnessInput = {
          eyeState: parsed.freshness?.eyeState || 'prime',
          gillState: parsed.freshness?.gillState || 'prime',
          skinState: parsed.freshness?.skinState || 'prime',
          fleshState: parsed.freshness?.fleshState || 'prime',
        };

        return {
          topMatch: {
            species: matchedSpecies,
            confidence: Math.min(99, Math.max(75, parsed.confidence || 95)),
            distinguishingFeaturesEn:
              parsed.distinguishingFeaturesEn && parsed.distinguishingFeaturesEn.length > 0
                ? parsed.distinguishingFeaturesEn
                : matchedSpecies.physicalFeaturesEn,
            distinguishingFeaturesFa:
              parsed.distinguishingFeaturesFa && parsed.distinguishingFeaturesFa.length > 0
                ? parsed.distinguishingFeaturesFa
                : matchedSpecies.physicalFeaturesFa,
          },
          alternatives,
          automatedFreshnessEstimate: freshnessEstimate,
          scanTimestamp: Date.now(),
        };
      } catch {
        // Continue to next model on error
      }
    }

    return null;
  }
}

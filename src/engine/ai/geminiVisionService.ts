import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_FISH_SPECIES } from '../../database/seedData';
import { FishSpecies } from '../../database/schema';
import { InspectionPrediction } from '../cv/speciesClassifier';
import { calculateFreshness, FreshnessInput, FreshnessResult } from '../freshnessGrader';

const GEMINI_STORAGE_KEY = '@fish_inspector_gemini_api_key';

export interface GeminiFreshnessAssessment {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  eyeState: 'prime' | 'good' | 'poor';
  gillState: 'prime' | 'good' | 'poor';
  skinState: 'prime' | 'good' | 'poor';
  fleshState: 'prime' | 'good' | 'poor';
  eyeObservationsFa: string;
  eyeObservationsEn: string;
  gillObservationsFa: string;
  gillObservationsEn: string;
  skinObservationsFa: string;
  skinObservationsEn: string;
  fleshObservationsFa: string;
  fleshObservationsEn: string;
  summaryFa: string;
  summaryEn: string;
  culinaryVerdictFa: string;
  culinaryVerdictEn: string;
  daysOnIceRemainingFa: string;
  daysOnIceRemainingEn: string;
}

export interface GeminiClassificationResult {
  speciesId: string;
  confidence: number;
  distinguishingFeaturesFa: string[];
  distinguishingFeaturesEn: string[];
  freshness: GeminiFreshnessAssessment;
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
   * Identifies the fish species AND evaluates 4-point biological freshness using Google Gemini Vision AI.
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

    const systemPrompt = `You are an elite marine ichthyologist and senior commercial fisheries quality inspector specializing in Persian Gulf, Caspian Sea, and commercial aquaculture species.

Carefully examine this fish image and perform TWO tasks with extreme precision:
1. SPECIES IDENTIFICATION: Match the fish strictly to ONE of the 46 known catalog species listed below.
2. 4-POINT BIOLOGICAL FRESHNESS EVALUATION (FAO / Quality Index Method):
   Analyze:
   - Eyes: Pupil clarity (deep clear black vs cloudy/milky) & cornea (bulging convex vs flat/sunken).
   - Gills: Bright crimson/red vs pale pink/brown/foul mucus.
   - Skin & Scales: Metallic iridescent sheen, firmly adhering scales vs dull, dry, sloughing scales.
   - Flesh & Belly: Firm elastic muscular resilience, intact belly vs soft, depressed or burst belly.

CATALOG OF 46 KNOWN SPECIES:
${JSON.stringify(catalogSummary, null, 1)}

KEY IDENTIFICATION RULES:
- Great Barracuda / Sphyraena (ماهی دولمی / کوتر): Slender needle/torpedo body, pointed snout, dagger fangs -> speciesId "dolmi".
- Silver Pomfret / Pampus argenteus (حلوا سفید / زبیدی): Silvery diamond flattened disc -> speciesId "zobaidi".
- Black Pomfret (حلوا سیاه): Dark oval disc -> speciesId "halva_siah".
- Spanish Mackerel (ماهی شیر): Elongated silvery body with vertical dark wavy lines -> speciesId "shir".
- King Mackerel (ماهی قباد): Mackerel body with scattered round spots -> speciesId "ghobad".
- Orange-spotted Grouper (هامور): Robust body, rounded head with brown/orange spots -> speciesId "hamour".
- Javelin Grunter (سنگسر): Compressed silvery body with golden/olive back and stiff operculum -> speciesId "sangsar".
- Mahi-mahi (ماهی عنزه / دلفین‌ماهی): Bright neon green/yellow, steep blunt forehead -> speciesId "mahimahi".
- Kawakawa / Mackerel Tuna (ماهی زرده / تن زرده): Tuna body with broken dark oblique lines above lateral line and dark spots between pectoral and pelvic fins -> speciesId "zardeh".

RETURN ONLY VALID RAW JSON WITH THIS EXACT STRUCTURE:
{
  "speciesId": "<exact id matching one of the 46 species above>",
  "confidence": <integer percentage 80-99>,
  "distinguishingFeaturesFa": ["ویژگی متمایز ظاهری ۱", "ویژگی متمایز ۲", "ویژگی متمایز ۳"],
  "distinguishingFeaturesEn": ["Distinguishing feature 1", "Distinguishing feature 2", "Distinguishing feature 3"],
  "freshness": {
    "score": <integer percentage 0-100>,
    "grade": "A" | "B" | "C" | "D",
    "eyeState": "prime" | "good" | "poor",
    "gillState": "prime" | "good" | "poor",
    "skinState": "prime" | "good" | "poor",
    "fleshState": "prime" | "good" | "poor",
    "eyeObservationsFa": "توضیح ارزیابی چشم به فارسی",
    "eyeObservationsEn": "Eye observation in English",
    "gillObservationsFa": "توضیح ارزیابی آبشش به فارسی",
    "gillObservationsEn": "Gill observation in English",
    "skinObservationsFa": "توضیح ارزیابی پوست و پولک به فارسی",
    "skinObservationsEn": "Skin and scales observation in English",
    "fleshObservationsFa": "توضیح قوام بافت و شکم به فارسی",
    "fleshObservationsEn": "Flesh and belly observation in English",
    "summaryFa": "خلاصه وضعیت تازگی و زمان تقریبی صید به فارسی",
    "summaryEn": "Freshness summary and catch recency in English",
    "culinaryVerdictFa": "توصیه طبخ و سلامت مصرف به فارسی",
    "culinaryVerdictEn": "Culinary recommendation and safety in English",
    "daysOnIceRemainingFa": "مدت زمان ماندگاری تخمینی در یخ به فارسی",
    "daysOnIceRemainingEn": "Estimated remaining shelf-life on ice in English"
  },
  "alternatives": [
    { "speciesId": "<alternative id 1>", "confidence": <integer> },
    { "speciesId": "<alternative id 2>", "confidence": <integer> }
  ]
}

DO NOT output Markdown backticks or extra commentary. Return raw JSON only.`;

    const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

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

        const freshnessInput: FreshnessInput = {
          eyeState: parsed.freshness?.eyeState || 'prime',
          gillState: parsed.freshness?.gillState || 'prime',
          skinState: parsed.freshness?.skinState || 'prime',
          fleshState: parsed.freshness?.fleshState || 'prime',
        };

        const aiObs = {
          eyesFa: parsed.freshness?.eyeObservationsFa,
          eyesEn: parsed.freshness?.eyeObservationsEn,
          gillsFa: parsed.freshness?.gillObservationsFa,
          gillsEn: parsed.freshness?.gillObservationsEn,
          skinFa: parsed.freshness?.skinObservationsFa,
          skinEn: parsed.freshness?.skinObservationsEn,
          fleshFa: parsed.freshness?.fleshObservationsFa,
          fleshEn: parsed.freshness?.fleshObservationsEn,
          daysOnIceFa: parsed.freshness?.daysOnIceRemainingFa,
          daysOnIceEn: parsed.freshness?.daysOnIceRemainingEn,
          aiSummaryFa: parsed.freshness?.summaryFa,
          aiSummaryEn: parsed.freshness?.summaryEn,
          aiCulinaryVerdictFa: parsed.freshness?.culinaryVerdictFa,
          aiCulinaryVerdictEn: parsed.freshness?.culinaryVerdictEn,
        };

        const aiFreshnessResult = calculateFreshness(
          freshnessInput,
          aiObs,
          parsed.freshness?.score
        );

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
          automatedFreshnessEstimate: freshnessInput,
          aiFreshnessResult,
          scanTimestamp: Date.now(),
          detectedWithAI: true,
        };
      } catch {
        // Continue to next model on error
      }
    }

    return null;
  }

  /**
   * Dedicated Freshness Inspection with Gemini AI for any fish species or organ close-up.
   */
  static async inspectFreshnessWithGemini(
    base64Data: string,
    fish: FishSpecies,
    mimeType: string = 'image/jpeg'
  ): Promise<FreshnessResult | null> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return null;

    const prompt = `You are a certified marine food safety and fish freshness inspector.
Inspect this fish image for commercial market freshness:
Target Species: ${fish.nameEn} (${fish.nameFa} - ${fish.scientificName}).

Perform a rigorous 4-point organ analysis:
1. Eyes: pupil clarity & corneal convexity
2. Gills: color & mucus
3. Skin & Scales: luster, slime transparency, scale adherence
4. Flesh & Belly: firmness, integrity

RETURN ONLY RAW JSON:
{
  "score": <0-100>,
  "grade": "A" | "B" | "C" | "D",
  "eyeState": "prime" | "good" | "poor",
  "gillState": "prime" | "good" | "poor",
  "skinState": "prime" | "good" | "poor",
  "fleshState": "prime" | "good" | "poor",
  "eyeObservationsFa": "ارزیابی چشم به فارسی",
  "eyeObservationsEn": "Eye observation in English",
  "gillObservationsFa": "ارزیابی آبشش به فارسی",
  "gillObservationsEn": "Gill observation in English",
  "skinObservationsFa": "ارزیابی پوست و پولک به فارسی",
  "skinObservationsEn": "Skin observation in English",
  "fleshObservationsFa": "ارزیابی قوام گوشت به فارسی",
  "fleshObservationsEn": "Flesh observation in English",
  "summaryFa": "خلاصه تازگی به فارسی",
  "summaryEn": "Freshness summary in English",
  "culinaryVerdictFa": "توصیه مصرف و طبخ به فارسی",
  "culinaryVerdictEn": "Culinary advice in English",
  "daysOnIceRemainingFa": "ماندگاری تخمینی در یخ به فارسی",
  "daysOnIceRemainingEn": "Shelf life on ice in English"
}`;

    const models = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (!response.ok) continue;
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) continue;

        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        const parsed: GeminiFreshnessAssessment = JSON.parse(cleaned);

        const input: FreshnessInput = {
          eyeState: parsed.eyeState || 'prime',
          gillState: parsed.gillState || 'prime',
          skinState: parsed.skinState || 'prime',
          fleshState: parsed.fleshState || 'prime',
        };

        const aiObs = {
          eyesFa: parsed.eyeObservationsFa,
          eyesEn: parsed.eyeObservationsEn,
          gillsFa: parsed.gillObservationsFa,
          gillsEn: parsed.gillObservationsEn,
          skinFa: parsed.skinObservationsFa,
          skinEn: parsed.skinObservationsEn,
          fleshFa: parsed.fleshObservationsFa,
          fleshEn: parsed.fleshObservationsEn,
          daysOnIceFa: parsed.daysOnIceRemainingFa,
          daysOnIceEn: parsed.daysOnIceRemainingEn,
          aiSummaryFa: parsed.summaryFa,
          aiSummaryEn: parsed.summaryEn,
          aiCulinaryVerdictFa: parsed.culinaryVerdictFa,
          aiCulinaryVerdictEn: parsed.culinaryVerdictEn,
        };

        return calculateFreshness(input, aiObs, parsed.score);
      } catch {
        // Try next model
      }
    }

    return null;
  }
}

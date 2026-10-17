import { ALL_FISH_SPECIES } from '../../database/seedData';
import { FishSpecies } from '../../database/schema';
import { InspectionPrediction } from '../cv/speciesClassifier';
import { calculateFreshness, FreshnessInput, FreshnessResult } from '../freshnessGrader';
import { GeminiPricingService, AiFishPrice } from './geminiPricingService';
import {
  getGeminiApiKey,
  saveGeminiApiKey,
  isGeminiConfigured,
  GEMINI_FLASH_MODELS,
  GEMINI_STORAGE_KEY,
} from './geminiConfig';
import { SPECIES_EXTRA_ALIASES } from '../cv/speciesAliases';

export { GEMINI_STORAGE_KEY };

/**
 * Resiliently maps any species name, ID, slug, Latin name, or dialect from Gemini to catalog.
 */
export function resolveSpeciesFromAiOutput(queryId: string): FishSpecies {
  const qLower = (queryId || '').toLowerCase().trim();
  const qClean = qLower.replace(/[^a-z0-9\u0600-\u06FF]/g, '');

  // 1. Direct ID match
  const byId = ALL_FISH_SPECIES.find(
    (f) => f.id.toLowerCase() === qLower || f.id.toLowerCase() === qClean
  );
  if (byId) return byId;

  // 2. Extra aliases match
  for (const [id, aliases] of Object.entries(SPECIES_EXTRA_ALIASES)) {
    if (id === qClean) {
      const sp = ALL_FISH_SPECIES.find((f) => f.id === id);
      if (sp) return sp;
    }
    for (const alias of aliases) {
      const aliasClean = alias.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
      if (aliasClean === qClean || qClean.includes(aliasClean) || aliasClean.includes(qClean)) {
        const sp = ALL_FISH_SPECIES.find((f) => f.id === id);
        if (sp) return sp;
      }
    }
  }

  // 3. Normalized slug check
  const bySlug = ALL_FISH_SPECIES.find((f) => {
    const slugClean = f.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    return slugClean.includes(qClean) || qClean.includes(slugClean);
  });
  if (bySlug) return bySlug;

  // 4. Substring in English name or scientific name or Persian name
  const byName = ALL_FISH_SPECIES.find((f) => {
    const enClean = f.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sciClean = (f.scientificName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const faClean = f.nameFa.replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    return (
      enClean.includes(qClean) ||
      qClean.includes(enClean) ||
      sciClean.includes(qClean) ||
      qClean.includes(sciClean) ||
      faClean.includes(qClean) ||
      qClean.includes(faClean)
    );
  });
  if (byName) return byName;

  // 5. Fallback: dolmi or first catalog item
  return ALL_FISH_SPECIES.find((f) => f.id === 'dolmi') || ALL_FISH_SPECIES[0];
}

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
  pricing?: {
    pricePerKgToman?: number;
    pricePerKgUsd?: number;
    minPriceToman?: number;
    maxPriceToman?: number;
    marketNotesFa?: string;
    marketNotesEn?: string;
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
    return getGeminiApiKey();
  }

  /**
   * Saves the Gemini API key to local persistent storage.
   */
  static async saveApiKey(apiKey: string): Promise<void> {
    return saveGeminiApiKey(apiKey);
  }

  /**
   * Checks whether a valid Gemini API key is configured.
   */
  static async isConfigured(): Promise<boolean> {
    return isGeminiConfigured();
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

Carefully examine this fish image and perform THREE tasks with extreme precision:
1. SPECIES IDENTIFICATION: Match the fish strictly to ONE of the 46 known catalog species listed below.
2. 4-POINT BIOLOGICAL FRESHNESS EVALUATION (FAO / Quality Index Method):
   Analyze eyes, gills, skin & scales, flesh & belly.
3. CURRENT COMMERCIAL MARKET PRICING:
   Estimate realistic retail market price per kg in Iranian Toman and USD in Iranian seafood markets.

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
  "pricing": {
    "pricePerKgToman": <integer estimated price per kg in Toman>,
    "pricePerKgUsd": <float estimated USD equivalent>,
    "minPriceToman": <integer min price in Toman>,
    "maxPriceToman": <integer max price in Toman>,
    "marketNotesFa": "توضیح کوتاه وضعیت قیمت روز بازار در ایران",
    "marketNotesEn": "Short market pricing note in English"
  },
  "alternatives": [
    { "speciesId": "<alternative id 1>", "confidence": <integer> },
    { "speciesId": "<alternative id 2>", "confidence": <integer> }
  ]
}

DO NOT output Markdown backticks or extra commentary. Return raw JSON only.`;

    for (const model of GEMINI_FLASH_MODELS) {
      try {
        console.log(`[GeminiVision] Attempting model: ${model}...`);
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          console.warn(`[GeminiVision] Model ${model} returned HTTP ${response.status}: ${errBody.substring(0, 150)}`);
          continue;
        }

        const data = await response.json();
        const textContent =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (!textContent) {
          console.warn(`[GeminiVision] Model ${model} returned empty text content`);
          continue;
        }

        console.log(`[GeminiVision] Model ${model} returned JSON (${textContent.length} chars)`);
        const cleanedJson = textContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        const parsed: GeminiClassificationResult = JSON.parse(cleanedJson);
        console.log(`[GeminiVision] Parsed speciesId: "${parsed.speciesId}", confidence: ${parsed.confidence}`);

        const matchedSpecies = resolveSpeciesFromAiOutput(parsed.speciesId);
        console.log(`[GeminiVision] Resolved to catalog species: "${matchedSpecies.id}" (${matchedSpecies.nameEn})`);

        // Build alternatives
        const alternatives: {
          species: FishSpecies;
          confidence: number;
          distinguishingFeaturesEn: string[];
          distinguishingFeaturesFa: string[];
        }[] = [];

        if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
          for (const alt of parsed.alternatives) {
            const altSpecies = resolveSpeciesFromAiOutput(alt.speciesId);
            if (
              altSpecies &&
              altSpecies.id !== matchedSpecies.id &&
              !alternatives.some((a) => a.species.id === altSpecies.id)
            ) {
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

        let aiPrice: AiFishPrice | undefined;
        if (parsed.pricing && parsed.pricing.pricePerKgToman && parsed.pricing.pricePerKgToman > 0) {
          aiPrice = {
            speciesId: matchedSpecies.id,
            pricePerKgToman: Math.round(parsed.pricing.pricePerKgToman),
            pricePerKgUsd: Math.round((parsed.pricing.pricePerKgUsd || parsed.pricing.pricePerKgToman / 85000) * 10) / 10,
            minPriceToman: Math.round(parsed.pricing.minPriceToman || parsed.pricing.pricePerKgToman * 0.8),
            maxPriceToman: Math.round(parsed.pricing.maxPriceToman || parsed.pricing.pricePerKgToman * 1.25),
            marketNotesFa: parsed.pricing.marketNotesFa || 'برآورد هوش مصنوعی بر اساس رصد زنده تصویر صید',
            marketNotesEn: parsed.pricing.marketNotesEn || 'AI live market estimate based on visual catch quality',
            lastUpdated: Date.now(),
            isAiEstimated: true,
          };
          GeminiPricingService.saveAiPrice(aiPrice).catch(() => {});
        } else {
          aiPrice = (await GeminiPricingService.getPriceForSpecies(matchedSpecies.id)) || undefined;
        }

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
          aiPrice,
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

    for (const model of GEMINI_FLASH_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

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
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

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

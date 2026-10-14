import { FishSpecies } from '../../database/schema';
import { ALL_FISH_SPECIES } from '../../database/seedData';
import { FreshnessInput } from '../freshnessGrader';

export interface ClassificationMatch {
  species: FishSpecies;
  confidence: number; // 0 to 100%
  distinguishingFeaturesEn: string[];
  distinguishingFeaturesFa: string[];
}

export interface InspectionPrediction {
  topMatch: ClassificationMatch;
  alternatives: ClassificationMatch[];
  automatedFreshnessEstimate: FreshnessInput;
  scanTimestamp: number;
}

export async function classifyFishPhoto(
  _imageUri: string,
  targetSpeciesIdHint?: string
): Promise<InspectionPrediction> {
  // Simulate rapid on-device neural/feature extraction inference (300-600ms)
  await new Promise((resolve) => setTimeout(resolve, 450));

  let primary: FishSpecies;
  if (targetSpeciesIdHint) {
    primary = ALL_FISH_SPECIES.find((s) => s.id === targetSpeciesIdHint) || ALL_FISH_SPECIES[0];
  } else {
    // Pick from prominent popular market species if no specific hint
    const candidates = ['zobaidi', 'shir', 'sorkhoo', 'hamour', 'shoorideh', 'ghobad', 'kutum', 'ghezelala'];
    const randomId = candidates[Math.floor(Math.random() * candidates.length)];
    primary = ALL_FISH_SPECIES.find((s) => s.id === randomId) || ALL_FISH_SPECIES[0];
  }

  // Generate related alternative candidates based on same category or family
  const categoryAlts = ALL_FISH_SPECIES.filter(
    (s) => s.category === primary.category && s.id !== primary.id
  );
  const alt1 = categoryAlts[0] || ALL_FISH_SPECIES[1];
  const alt2 = categoryAlts[1] || ALL_FISH_SPECIES[2];

  const primaryConfidence = Math.floor(88 + Math.random() * 9); // 88% - 96%
  const alt1Confidence = Math.floor(65 + Math.random() * 14);
  const alt2Confidence = Math.floor(45 + Math.random() * 15);

  const topMatch: ClassificationMatch = {
    species: primary,
    confidence: primaryConfidence,
    distinguishingFeaturesEn: primary.physicalFeaturesEn,
    distinguishingFeaturesFa: primary.physicalFeaturesFa,
  };

  const alternatives: ClassificationMatch[] = [
    {
      species: alt1,
      confidence: alt1Confidence,
      distinguishingFeaturesEn: alt1.physicalFeaturesEn,
      distinguishingFeaturesFa: alt1.physicalFeaturesFa,
    },
    {
      species: alt2,
      confidence: alt2Confidence,
      distinguishingFeaturesEn: alt2.physicalFeaturesEn,
      distinguishingFeaturesFa: alt2.physicalFeaturesFa,
    },
  ];

  // Automated visual check heuristics:
  // Randomly simulate fresh/prime optical markers typical in market inspections
  const automatedFreshnessEstimate: FreshnessInput = {
    eyeState: Math.random() > 0.2 ? 'prime' : 'good',
    gillState: Math.random() > 0.25 ? 'prime' : 'good',
    skinState: Math.random() > 0.15 ? 'prime' : 'good',
    fleshState: 'prime',
  };

  return {
    topMatch,
    alternatives,
    automatedFreshnessEstimate,
    scanTimestamp: Date.now(),
  };
}

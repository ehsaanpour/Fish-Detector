export type FishCategory = 'persian_gulf' | 'caspian' | 'freshwater' | 'global';
export type PriceTier = 'budget' | 'mid' | 'premium';

export interface RegionalName {
  region: 'bushehr' | 'hormozgan' | 'khuzestan' | 'south' | 'chabahar' | 'gilan' | 'mazandaran' | 'north';
  regionFa: string;
  dialectName: string;
}

export interface FishSpecies {
  id: string;
  slug: string;
  nameEn: string;
  nameFa: string;
  scientificName: string;
  category: FishCategory;
  priceTier: PriceTier;
  defaultPriceToman: number;
  defaultPriceUsd: number;
  boneLevel: number; // 1 to 5 (1 = almost no bones, 5 = heavy pin bones)
  boneDescEn: string;
  boneDescFa: string;
  meatTextureEn: string;
  meatTextureFa: string;
  flavorProfileEn: string;
  flavorProfileFa: string;
  cookingMethodsEn: string[];
  cookingMethodsFa: string[];
  physicalFeaturesEn: string[];
  physicalFeaturesFa: string[];
  regionalNames: RegionalName[];
  assetKey: string;
  colorHex: string;
}

export interface InspectionRecord {
  id: string;
  fishId: string;
  fishName: string;
  timestamp: number;
  freshnessScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  eyeScore: number;
  gillScore: number;
  skinScore: number;
  fleshScore: number;
  notes?: string;
  imageUri?: string;
}

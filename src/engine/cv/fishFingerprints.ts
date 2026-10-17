// Precomputed visual, morphological and biological fingerprints for all 46 commercial fish species
export type FishMorphologyCategory = 'needle' | 'torpedo' | 'fusiform' | 'compressed' | 'diamond_disc';

export type FishColorPalette =
  | 'silver_bars'
  | 'mirror_silver'
  | 'red_pink'
  | 'mottled_brown_olive'
  | 'dark_blue_silver'
  | 'neon_golden_green'
  | 'charcoal_dark'
  | 'silvery_olive';

export interface FishVisualFingerprint {
  dHash: string;
  dHashFlip?: string;
  avgR: number;
  avgG: number;
  avgB: number;
  aspectRatio: number;
  // Biometric & biological ground truth
  morphology: FishMorphologyCategory;
  biologicalAspectRatio: number; // Length-to-body-depth ratio
  colorPalette: FishColorPalette;
}

/**
 * Computes horizontal reflection of a 64-bit 8x8 difference hash.
 */
export function computeFlipHash(hash: string): string {
  if (!hash || hash.length !== 64) return hash;
  let flipped = '';
  for (let r = 0; r < 8; r++) {
    const row = hash.substring(r * 8, (r + 1) * 8);
    flipped += row.split('').reverse().join('');
  }
  return flipped;
}

export const FISH_FINGERPRINTS: Record<string, FishVisualFingerprint> = {
  "shir": {
    "avgB": 129,
    "dHash": "0110011001010010011110100101101100101110001001110011001100110110",
    "aspectRatio": 1.33,
    "avgR": 118,
    "avgG": 127,
    "morphology": "needle",
    "biologicalAspectRatio": 3.8,
    "colorPalette": "silver_bars"
  },
  "ozonboron": {
    "avgB": 228,
    "dHash": "1000000000000000000000101110010111100100111010100010100000000000",
    "aspectRatio": 2.19,
    "avgR": 229,
    "avgG": 228,
    "morphology": "needle",
    "biologicalAspectRatio": 4.5,
    "colorPalette": "charcoal_dark"
  },
  "ordak_mahi": {
    "avgB": 218,
    "dHash": "0000000000000000000000100111010011010100111010100010101000000000",
    "aspectRatio": 1.79,
    "avgR": 227,
    "avgG": 225,
    "morphology": "needle",
    "biologicalAspectRatio": 4.2,
    "colorPalette": "mottled_brown_olive"
  },
  "atlantic_salmon": {
    "avgB": 91,
    "dHash": "0001011101001011011110110000111000011111000011110100001101010011",
    "aspectRatio": 2.86,
    "avgR": 119,
    "avgG": 129,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.9,
    "colorPalette": "dark_blue_silver"
  },
  "swordfish": {
    "avgB": 12,
    "dHash": "0000000000000000000000000000011100000011000000100000000000000000",
    "aspectRatio": 1.5,
    "avgR": 14,
    "avgG": 13,
    "morphology": "needle",
    "biologicalAspectRatio": 4.0,
    "colorPalette": "charcoal_dark"
  },
  "sorkhoo": {
    "avgB": 129,
    "dHash": "1000011010010100111101001101111111111110111011001111100011111100",
    "aspectRatio": 1.33,
    "avgR": 135,
    "avgG": 120,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.6,
    "colorPalette": "red_pink"
  },
  "haddock": {
    "avgB": 54,
    "dHash": "0101000001101100001011000001011100011011001101110011011001001111",
    "aspectRatio": 1.51,
    "avgR": 48,
    "avgG": 54,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.2,
    "colorPalette": "mottled_brown_olive"
  },
  "zaminkan": {
    "avgB": 136,
    "dHash": "0111011001110010111110001111100001110100011111100101101001101110",
    "aspectRatio": 1.78,
    "avgR": 187,
    "avgG": 164,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.8,
    "colorPalette": "mottled_brown_olive"
  },
  "hoor": {
    "avgB": 132,
    "dHash": "0111100001110000011100010000110100100110000101100000110101100000",
    "aspectRatio": 2.41,
    "avgR": 79,
    "avgG": 121,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.8,
    "colorPalette": "dark_blue_silver"
  },
  "azad_khazar": {
    "avgB": 33,
    "dHash": "1110000101010001001100111001101110011110010001110110001100100110",
    "aspectRatio": 0.8,
    "avgR": 42,
    "avgG": 49,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.9,
    "colorPalette": "dark_blue_silver"
  },
  "kutum": {
    "avgB": 172,
    "dHash": "0111001001101010011010001100101110010111110101000111000000110100",
    "aspectRatio": 1.79,
    "avgR": 177,
    "avgG": 173,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.8,
    "colorPalette": "silvery_olive"
  },
  "skipjack": {
    "avgB": 226,
    "dHash": "0000000000000000001100011110000111001100110011010110000100000000",
    "aspectRatio": 1.79,
    "avgR": 224,
    "avgG": 223,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.7,
    "colorPalette": "dark_blue_silver"
  },
  "hamour": {
    "avgB": 33,
    "dHash": "0000000000000000000011110001111100100110000101100001101000000000",
    "aspectRatio": 1.33,
    "avgR": 38,
    "avgG": 36,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.8,
    "colorPalette": "mottled_brown_olive"
  },
  "shahri": {
    "avgB": 181,
    "dHash": "0100000001000010010000100100111001001100010010000100110001011000",
    "aspectRatio": 1.33,
    "avgR": 72,
    "avgG": 134,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.7,
    "colorPalette": "silvery_olive"
  },
  "shank": {
    "avgB": 88,
    "dHash": "1000001000000010000000100110000001000100110001111000010000000011",
    "aspectRatio": 1.5,
    "avgR": 138,
    "avgG": 112,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.6,
    "colorPalette": "silvery_olive"
  },
  "meyd": {
    "avgB": 148,
    "dHash": "0011010000110110000100000101000000110011111000000110001001001110",
    "aspectRatio": 1.49,
    "avgR": 134,
    "avgG": 160,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.3,
    "colorPalette": "mirror_silver"
  },
  "tilapia": {
    "avgB": 77,
    "dHash": "0101100101011001000011100100001100011001000101010011011101110100",
    "aspectRatio": 1.4,
    "avgR": 105,
    "avgG": 111,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.7,
    "colorPalette": "silver_bars"
  },
  "ghezelala": {
    "avgB": 194,
    "dHash": "0000000000000000100110001101000011100010101110000111110000000000",
    "aspectRatio": 2.23,
    "avgR": 209,
    "avgG": 208,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.6,
    "colorPalette": "mottled_brown_olive"
  },
  "kefal_khazar": {
    "avgB": 128,
    "dHash": "0101001100110000011101100100001100000101011100000110000000111001",
    "aspectRatio": 1.26,
    "avgR": 87,
    "avgG": 102,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.8,
    "colorPalette": "silvery_olive"
  },
  "ghobad": {
    "avgB": 212,
    "dHash": "0110011001010110011010001110000111000110110010010100100001010110",
    "aspectRatio": 1.79,
    "avgR": 200,
    "avgG": 206,
    "morphology": "needle",
    "biologicalAspectRatio": 3.4,
    "colorPalette": "silver_bars"
  },
  "mackerel_sardine": {
    "avgB": 60,
    "dHash": "0011000100110111111001101110000011100011110011100001100000110000",
    "aspectRatio": 1.5,
    "avgR": 101,
    "avgG": 88,
    "morphology": "torpedo",
    "biologicalAspectRatio": 3.0,
    "colorPalette": "dark_blue_silver"
  },
  "sobaity": {
    "avgB": 209,
    "dHash": "0000000000110000011100011110100111000110111000110110110100110000",
    "aspectRatio": 1.79,
    "avgR": 211,
    "avgG": 210,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.7,
    "colorPalette": "silvery_olive"
  },
  "halva_siah": {
    "avgB": 73,
    "dHash": "0000011000110010011100101101110110001110000111010111101000010011",
    "aspectRatio": 1.35,
    "avgR": 123,
    "avgG": 162,
    "morphology": "diamond_disc",
    "biologicalAspectRatio": 1.30,
    "colorPalette": "charcoal_dark"
  },
  "european_seabass": {
    "avgB": 84,
    "dHash": "0010101100001011010010110000001100001110000111001110000001100100",
    "aspectRatio": 1.51,
    "avgR": 56,
    "avgG": 66,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.3,
    "colorPalette": "silvery_olive"
  },
  "dolmi": {
    "avgB": 161,
    "dHash": "0111110001111110011111100111011000110010110000101100110101101001",
    "aspectRatio": 1.5,
    "avgR": 47,
    "avgG": 125,
    "morphology": "needle",
    "biologicalAspectRatio": 4.6,
    "colorPalette": "silver_bars"
  },
  "rashgoo": {
    "avgB": 223,
    "dHash": "0000000000000000001000011110100111101110110110010110000100000000",
    "aspectRatio": 1.79,
    "avgR": 231,
    "avgG": 229,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.3,
    "colorPalette": "mirror_silver"
  },
  "shoorideh": {
    "avgB": 38,
    "dHash": "0000000000000000000100000001111100111111001101110001000000000000",
    "aspectRatio": 1.5,
    "avgR": 39,
    "avgG": 38,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.3,
    "colorPalette": "silvery_olive"
  },
  "talal": {
    "avgB": 230,
    "dHash": "0000000000000000001100001111000111000010110010010110000100000000",
    "aspectRatio": 1.79,
    "avgR": 232,
    "avgG": 232,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.6,
    "colorPalette": "mirror_silver"
  },
  "kharoo": {
    "avgB": 157,
    "dHash": "0000011100000111000001110000010111000110010001110100011000000111",
    "aspectRatio": 1.5,
    "avgR": 178,
    "avgG": 169,
    "morphology": "needle",
    "biologicalAspectRatio": 4.4,
    "colorPalette": "mirror_silver"
  },
  "cod": {
    "avgB": 149,
    "dHash": "0110111101101111011011111100111100011111010011110110011001110111",
    "aspectRatio": 1.5,
    "avgR": 40,
    "avgG": 93,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.0,
    "colorPalette": "mottled_brown_olive"
  },
  "sarem": {
    "avgB": 166,
    "dHash": "0000001100000110010011100100011001011101010110000001000000010111",
    "aspectRatio": 1.33,
    "avgR": 11,
    "avgG": 144,
    "morphology": "torpedo",
    "biologicalAspectRatio": 3.0,
    "colorPalette": "mirror_silver"
  },
  "kafshak": {
    "avgB": 157,
    "dHash": "0000000000110000011100001101010011000100110111000111000000110000",
    "aspectRatio": 1.79,
    "avgR": 185,
    "avgG": 171,
    "morphology": "diamond_disc",
    "biologicalAspectRatio": 1.8,
    "colorPalette": "mottled_brown_olive"
  },
  "kapoor": {
    "avgB": 194,
    "dHash": "0100000000001000001100001010001011000011101001110111110000001000",
    "aspectRatio": 2.02,
    "avgR": 199,
    "avgG": 199,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.0,
    "colorPalette": "mottled_brown_olive"
  },
  "souf": {
    "avgB": 115,
    "dHash": "0110001001111000001110001010001010001111100001001010001001100110",
    "aspectRatio": 2.1,
    "avgR": 129,
    "avgG": 121,
    "morphology": "torpedo",
    "biologicalAspectRatio": 3.2,
    "colorPalette": "silvery_olive"
  },
  "seebass_jonoob": {
    "avgB": 109,
    "dHash": "0110100001101100011011101110001011010011110101100110111001101111",
    "aspectRatio": 1.33,
    "avgR": 134,
    "avgG": 137,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.1,
    "colorPalette": "silvery_olive"
  },
  "sakan": {
    "avgB": 195,
    "dHash": "0000010000000000001100011111000111001011111010010101100101000000",
    "aspectRatio": 2.56,
    "avgR": 195,
    "avgG": 196,
    "morphology": "needle",
    "biologicalAspectRatio": 3.8,
    "colorPalette": "charcoal_dark"
  },
  "sangsar": {
    "avgB": 181,
    "dHash": "0100000001001000010011000001011000000111001001110000011101000000",
    "aspectRatio": 1.62,
    "avgR": 93,
    "avgG": 123,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.8,
    "colorPalette": "silvery_olive"
  },
  "zobaidi": {
    "avgB": 90,
    "dHash": "0101001101001011010110110001111100011111001011110001111101001111",
    "aspectRatio": 1.58,
    "avgR": 132,
    "avgG": 167,
    "morphology": "diamond_disc",
    "biologicalAspectRatio": 1.25,
    "colorPalette": "mirror_silver"
  },
  "gish": {
    "avgB": 225,
    "dHash": "0000000000000000011100001110000011000110111000010110100000000000",
    "aspectRatio": 1.79,
    "avgR": 228,
    "avgG": 228,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.1,
    "colorPalette": "mirror_silver"
  },
  "zardeh": {
    "avgB": 228,
    "dHash": "0000000000000000001100011111100111110110111000010010010000000000",
    "aspectRatio": 1.79,
    "avgR": 225,
    "avgG": 227,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.7,
    "colorPalette": "dark_blue_silver"
  },
  "mahimahi": {
    "avgB": 211,
    "dHash": "0000000000000000011000001110000111011100110110011101000000000000",
    "aspectRatio": 1.5,
    "avgR": 221,
    "avgG": 226,
    "morphology": "compressed",
    "biologicalAspectRatio": 2.5,
    "colorPalette": "neon_golden_green"
  },
  "soltan_ebrahim": {
    "avgB": 222,
    "dHash": "0100110000000000011000101101100011001110110110100110000000000000",
    "aspectRatio": 1.79,
    "avgR": 242,
    "avgG": 227,
    "morphology": "fusiform",
    "biologicalAspectRatio": 2.0,
    "colorPalette": "red_pink"
  },
  "yellowfin_tuna": {
    "avgB": 59,
    "dHash": "0000000100000001000101000010010000101110001110100011001000000010",
    "aspectRatio": 1.65,
    "avgR": 87,
    "avgG": 85,
    "morphology": "torpedo",
    "biologicalAspectRatio": 2.8,
    "colorPalette": "dark_blue_silver"
  },
  "dorade": {
    "avgB": 68,
    "dHash": "0110011001000011010110000001110100101111000111001101010001010010",
    "aspectRatio": 1.5,
    "avgR": 70,
    "avgG": 79,
    "morphology": "compressed",
    "biologicalAspectRatio": 1.6,
    "colorPalette": "silvery_olive"
  },
  "halibut": {
    "avgB": 72,
    "dHash": "0101100100101011000001110000101101000110110011101001001101110101",
    "aspectRatio": 1.33,
    "avgR": 75,
    "avgG": 71,
    "morphology": "diamond_disc",
    "biologicalAspectRatio": 1.5,
    "colorPalette": "mottled_brown_olive"
  },
  "kilka": {
    "avgB": 236,
    "dHash": "0000000000000000000100001111000011000110111000010011000000000000",
    "aspectRatio": 1.79,
    "avgR": 234,
    "avgG": 237,
    "morphology": "torpedo",
    "biologicalAspectRatio": 3.0,
    "colorPalette": "mirror_silver"
  }
};

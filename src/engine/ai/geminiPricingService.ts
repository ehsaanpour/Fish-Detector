import AsyncStorage from '@react-native-async-storage/async-storage';
import { FishSpecies } from '../../database/schema';
import { getGeminiApiKey, GEMINI_FLASH_MODELS } from './geminiConfig';

const AI_PRICES_STORAGE_KEY = '@fish_inspector_ai_prices_v1';

export interface AiFishPrice {
  speciesId: string;
  pricePerKgToman: number;
  pricePerKgUsd: number;
  minPriceToman: number;
  maxPriceToman: number;
  marketNotesFa: string;
  marketNotesEn: string;
  lastUpdated: number;
  isAiEstimated: boolean;
}

// Initial realistic Iranian seafood market benchmarks (Persian Gulf, Caspian, Farmed, Imported)
const INITIAL_AI_MARKET_BENCHMARKS: Record<string, Omit<AiFishPrice, 'speciesId' | 'lastUpdated'>> = {
  // Persian Gulf & Sea of Oman
  shir: {
    pricePerKgToman: 680000,
    pricePerKgUsd: 10.5,
    minPriceToman: 550000,
    maxPriceToman: 820000,
    marketNotesFa: 'ماهی شیر ممتاز صید جنوب؛ نوسان قیمت بر اساس صید با قلاب یا تور و درشتی لاشه.',
    marketNotesEn: 'Narrow-barred Spanish Mackerel wild catch; higher prices for hook-and-line and larger cuts.',
    isAiEstimated: true,
  },
  zobaidi: {
    pricePerKgToman: 1350000,
    pricePerKgUsd: 20.8,
    minPriceToman: 950000,
    maxPriceToman: 1750000,
    marketNotesFa: 'حلوا سفید (زبیدی) اعلا خوزستان؛ لوکس‌ترین ماهی صادراتی با بالاترین نوسان بازار.',
    marketNotesEn: 'Silver Pomfret; highest-tier saltwater catch driven by high domestic and export demand.',
    isAiEstimated: true,
  },
  halva_siah: {
    pricePerKgToman: 420000,
    pricePerKgUsd: 6.5,
    minPriceToman: 340000,
    maxPriceToman: 500000,
    marketNotesFa: 'حلوا سیاه؛ جایگزین اقتصادی و بسیار باکیفیت برای حلوا سفید، مناسب سرخ‌کردنی.',
    marketNotesEn: 'Black Pomfret; popular economical alternative to silver pomfret.',
    isAiEstimated: true,
  },
  ghobad: {
    pricePerKgToman: 460000,
    pricePerKgUsd: 7.1,
    minPriceToman: 380000,
    maxPriceToman: 550000,
    marketNotesFa: 'ماهی قباد صید روز بوشهر و بندرعباس؛ گزینه‌ای عالی برای قلیه ماهی و استیک ماهی.',
    marketNotesEn: 'King Mackerel; steady supply and favorite choice for stews and grilling.',
    isAiEstimated: true,
  },
  hamour: {
    pricePerKgToman: 750000,
    pricePerKgUsd: 11.5,
    minPriceToman: 580000,
    maxPriceToman: 920000,
    marketNotesFa: 'هامور لکه‌دار ممتاز؛ گوشت سفید سفت بدون خار و ضایعات، تقاضای بالای رستورانی.',
    marketNotesEn: 'Orange-spotted Grouper; dense white flaky flesh with low waste and high demand.',
    isAiEstimated: true,
  },
  sangsar: {
    pricePerKgToman: 360000,
    pricePerKgUsd: 5.5,
    minPriceToman: 290000,
    maxPriceToman: 440000,
    marketNotesFa: 'ماهی سنگسر شهری؛ پرطرفدارترین ماهی روزمره جنوب برای پخت قلیه و ته چین ماهی.',
    marketNotesEn: 'Javelin Grunter; everyday Southern culinary staple with firm meat.',
    isAiEstimated: true,
  },
  sorkhoo: {
    pricePerKgToman: 540000,
    pricePerKgUsd: 8.3,
    minPriceToman: 430000,
    maxPriceToman: 660000,
    marketNotesFa: 'ماهی سرخو شکاری؛ رنگ صورتی جذاب و گوشت لطیف با تیغ‌های بسیار درشت و کم.',
    marketNotesEn: 'Red Snapper; tender, sweet flesh with large easy-to-remove bones.',
    isAiEstimated: true,
  },
  shoorideh: {
    pricePerKgToman: 590000,
    pricePerKgUsd: 9.1,
    minPriceToman: 460000,
    maxPriceToman: 720000,
    marketNotesFa: 'ماهی شوریده هندیجان و بوشهر؛ بافت بسیار لذیذ و محبوب برای پلوماهی سنتی.',
    marketNotesEn: 'Tigertooth Croaker; prized soft delicate meat popular for traditional fish pilaf.',
    isAiEstimated: true,
  },
  rashgoo: {
    pricePerKgToman: 780000,
    pricePerKgUsd: 12.0,
    minPriceToman: 620000,
    maxPriceToman: 960000,
    marketNotesFa: 'ماهی راشگو (آهوی دریا)؛ بافت پنبه‌ای ابریشمی و اشرافی، از گران‌ترین صیدهای جنوب.',
    marketNotesEn: 'Fourfinger Threadfin; delicate melt-in-mouth texture, known as the gazelle of the sea.',
    isAiEstimated: true,
  },
  sobaity: {
    pricePerKgToman: 640000,
    pricePerKgUsd: 9.8,
    minPriceToman: 510000,
    maxPriceToman: 780000,
    marketNotesFa: 'ماهی صبیتی صخره‌ای؛ گوشت سفید روغنی و لذیذ، عالی برای تنوری شکم‌پر.',
    marketNotesEn: 'Sobaity Seabream; rich oily white flesh ideal for baking.',
    isAiEstimated: true,
  },
  shank: {
    pricePerKgToman: 380000,
    pricePerKgUsd: 5.8,
    minPriceToman: 300000,
    maxPriceToman: 460000,
    marketNotesFa: 'ماهی شانک زردباله؛ طعم شیرین دریایی و اندازه مناسب برای کباب تک‌نفره.',
    marketNotesEn: 'Twobar Seabream; sweet flavor and convenient portion sizing.',
    isAiEstimated: true,
  },
  dolmi: {
    pricePerKgToman: 290000,
    pricePerKgUsd: 4.5,
    minPriceToman: 220000,
    maxPriceToman: 370000,
    marketNotesFa: 'ماهی کوتر/دولمی خلیج فارس؛ صید اقتصادی با فیله پرگوشت و مقرون‌به‌صرفه.',
    marketNotesEn: 'Great Barracuda; economical meaty predator with substantial fillet yield.',
    isAiEstimated: true,
  },
  sakan: {
    pricePerKgToman: 480000,
    pricePerKgUsd: 7.4,
    minPriceToman: 390000,
    maxPriceToman: 580000,
    marketNotesFa: 'ماهی سکن (سوکلا)؛ گوشت لخم بدون خار و بافتی شبیه ماهی تن برای استیک.',
    marketNotesEn: 'Cobia; boneless steak-cut fish with firm, succulent texture.',
    isAiEstimated: true,
  },
  mahimahi: {
    pricePerKgToman: 410000,
    pricePerKgUsd: 6.3,
    minPriceToman: 320000,
    maxPriceToman: 510000,
    marketNotesFa: 'ماهی عنزه (ماهی‌ماهی)؛ فیله بسیار تمیز بدون چربی اضافه، پرطرفدار در رژیم سلامت.',
    marketNotesEn: 'Mahi-mahi / Dolphinfish; lean firm white meat, excellent for clean grilling.',
    isAiEstimated: true,
  },
  zardeh: {
    pricePerKgToman: 260000,
    pricePerKgUsd: 4.0,
    minPriceToman: 200000,
    maxPriceToman: 330000,
    marketNotesFa: 'ماهی زرده (تن زرده)؛ گزینه خوش‌قیمت و پرانرژی سرشار از امگا-۳.',
    marketNotesEn: 'Kawakawa Mackerel Tuna; economical dark meat rich in omega-3.',
    isAiEstimated: true,
  },
  hoor: {
    pricePerKgToman: 340000,
    pricePerKgUsd: 5.2,
    minPriceToman: 260000,
    maxPriceToman: 420000,
    marketNotesFa: 'ماهی هوور (تن گوشت صورتی)؛ مصرف گسترده در کنسروسازی و استیک پخته.',
    marketNotesEn: 'Longtail Tuna; primary domestic tuna staple for canning and steaks.',
    isAiEstimated: true,
  },

  // Caspian Sea
  kutum: {
    pricePerKgToman: 650000,
    pricePerKgUsd: 10.0,
    minPriceToman: 500000,
    maxPriceToman: 820000,
    marketNotesFa: 'ماهی سفید خزر؛ نماد سبزی‌پلو نوروزی و محبوب‌ترین ماهی شمال کشور.',
    marketNotesEn: 'Caspian Kutum; traditional Norooz specialty and northern Iranian staple.',
    isAiEstimated: true,
  },
  souf: {
    pricePerKgToman: 580000,
    pricePerKgUsd: 8.9,
    minPriceToman: 450000,
    maxPriceToman: 720000,
    marketNotesFa: 'ماهی سوف سفید خزر؛ گوشت بسیار لطیف بدون تیغ‌های ریز، مناسب سرخ‌کردنی.',
    marketNotesEn: 'Pikeperch (Zander); premium white fillet with almost no pin-bones.',
    isAiEstimated: true,
  },
  kefal_khazar: {
    pricePerKgToman: 380000,
    pricePerKgUsd: 5.8,
    minPriceToman: 290000,
    maxPriceToman: 470000,
    marketNotesFa: 'ماهی کفال خزر؛ گوشت چرب و لذیذ، بسیار محبوب برای کباب زغالی شمالی.',
    marketNotesEn: 'Caspian Grey Mullet; rich fatty meat ideal for direct charcoal grilling.',
    isAiEstimated: true,
  },
  kilka: {
    pricePerKgToman: 110000,
    pricePerKgUsd: 1.7,
    minPriceToman: 80000,
    maxPriceToman: 150000,
    marketNotesFa: 'ماهی کیلکا خزر؛ مغذی‌ترین و در عین حال اقتصادی‌ترین ماهی غنی از کلسیم.',
    marketNotesEn: 'Caspian Sprat; nutrient-dense, highly economical whole-eating fish.',
    isAiEstimated: true,
  },
  ozonboron: {
    pricePerKgToman: 1600000,
    pricePerKgUsd: 24.6,
    minPriceToman: 1200000,
    maxPriceToman: 2100000,
    marketNotesFa: 'ماهی خاویاری اوزون‌برون (پرورشی قانونی)؛ گوشت لخم بدون استخوان غضروفی.',
    marketNotesEn: 'Stellatus Sturgeon; boneless cartilage-rich delicacy, legally farmed.',
    isAiEstimated: true,
  },

  // Farmed & Aquaculture
  ghezelala: {
    pricePerKgToman: 230000,
    pricePerKgUsd: 3.5,
    minPriceToman: 190000,
    maxPriceToman: 280000,
    marketNotesFa: 'قزل‌آلای رنگین‌کمان پرورشی؛ پرفروش‌ترین ماهی ایران با عرضه سراسری و نرخ متعادل.',
    marketNotesEn: 'Rainbow Trout; high-volume farmed freshwater fish with stable market supply.',
    isAiEstimated: true,
  },
  seebass_jonoob: {
    pricePerKgToman: 430000,
    pricePerKgUsd: 6.6,
    minPriceToman: 350000,
    maxPriceToman: 520000,
    marketNotesFa: 'ماهی سیباس پرورشی در قفس دریایی؛ گوشت سفید یکدست و کیفیت بالا.',
    marketNotesEn: 'Barramundi / Asian Seabass; sea-cage farmed with juicy, clean fillets.',
    isAiEstimated: true,
  },
  kapoor: {
    pricePerKgToman: 180000,
    pricePerKgUsd: 2.8,
    minPriceToman: 140000,
    maxPriceToman: 230000,
    marketNotesFa: 'کپور معمولی پرورشی؛ گوشت پرانرژی و به صرفه، مناسب قلیه و بریان.',
    marketNotesEn: 'Common Carp; budget-friendly freshwater farmed fish.',
    isAiEstimated: true,
  },
  tilapia: {
    pricePerKgToman: 210000,
    pricePerKgUsd: 3.2,
    minPriceToman: 170000,
    maxPriceToman: 260000,
    marketNotesFa: 'تیلاپیا پرورشی؛ فیله بدون استخوان و بدون بوی زهم با آماده‌سازی آسان.',
    marketNotesEn: 'Nile Tilapia; boneless, mild-flavored white fillet.',
    isAiEstimated: true,
  },

  // Imported
  atlantic_salmon: {
    pricePerKgToman: 1450000,
    pricePerKgUsd: 22.3,
    minPriceToman: 1100000,
    maxPriceToman: 1850000,
    marketNotesFa: 'ماهی سالمون نروژی وارداتی مرغوب؛ بافت نارنجی چرب سرشار از DHA و EPA.',
    marketNotesEn: 'Imported Norwegian Atlantic Salmon; premium high-fat culinary grade.',
    isAiEstimated: true,
  },
};

export class GeminiPricingService {
  private static memoryCache: Record<string, AiFishPrice> | null = null;

  /**
   * Loads all cached AI prices from AsyncStorage.
   */
  static async getAllCachedPrices(): Promise<Record<string, AiFishPrice>> {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      const stored = await AsyncStorage.getItem(AI_PRICES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, AiFishPrice>;
        this.memoryCache = parsed;
        return parsed;
      }
    } catch {
      // Ignore read error
    }

    // Initialize with latest market benchmarks if first launch
    const initial: Record<string, AiFishPrice> = {};
    const now = Date.now();
    for (const [id, data] of Object.entries(INITIAL_AI_MARKET_BENCHMARKS)) {
      initial[id] = {
        speciesId: id,
        ...data,
        lastUpdated: now,
      };
    }

    this.memoryCache = initial;
    await this.persistCache(initial);
    return initial;
  }

  /**
   * Retrieves the AI market price for a specific fish species.
   */
  static async getPriceForSpecies(speciesId: string): Promise<AiFishPrice | null> {
    const all = await this.getAllCachedPrices();
    return all[speciesId] || null;
  }

  /**
   * Synchronously retrieves the AI market price or initial benchmark.
   */
  static getCachedPriceSync(speciesId: string): AiFishPrice | null {
    if (this.memoryCache && this.memoryCache[speciesId]) {
      return this.memoryCache[speciesId];
    }
    const benchmark = INITIAL_AI_MARKET_BENCHMARKS[speciesId];
    if (benchmark) {
      return {
        speciesId,
        ...benchmark,
        lastUpdated: Date.now(),
      };
    }
    return null;
  }

  /**
   * Persists the AI pricing cache to AsyncStorage.
   */
  private static async persistCache(data: Record<string, AiFishPrice>): Promise<void> {
    try {
      await AsyncStorage.setItem(AI_PRICES_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }

  /**
   * Saves or updates an AI price entry directly.
   */
  static async saveAiPrice(price: AiFishPrice): Promise<void> {
    const all = await this.getAllCachedPrices();
    all[price.speciesId] = price;
    this.memoryCache = all;
    await this.persistCache(all);
  }

  /**
   * Fetches real-time market price for a single fish species using Google Gemini AI.
   */
  static async fetchPriceWithAi(fish: FishSpecies): Promise<AiFishPrice | null> {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      return this.getPriceForSpecies(fish.id);
    }

    const regionalNames = fish.regionalNames?.map((r) => r.dialectName).join(', ') || '';

    const prompt = `You are a professional Iranian fisheries economist and seafood market pricing specialist.
Provide the current realistic commercial market price per kilogram in Iranian Toman and USD for this fish species in Iran:
- Species: ${fish.nameEn} (${fish.nameFa} - ${fish.scientificName})
- Southern / Regional names: ${regionalNames}
- Commercial category/habitat: ${fish.category}

Consider:
- Real market retail prices in Tehran (e.g. Baqeri, Tajrish, Behesht-e Zahra markets), Bandar Abbas, Bushehr, Rasht fish docks.
- Exchange rate: approx 1 USD ≈ 65,000 - 85,000 Toman.
- Size, catch method, seasonal availability, and freshness quality.

OUTPUT STRICTLY VALID RAW JSON (no markdown backticks):
{
  "speciesId": "${fish.id}",
  "pricePerKgToman": <integer average price per kg in Toman>,
  "pricePerKgUsd": <float USD equivalent>,
  "minPriceToman": <integer lower market boundary in Toman>,
  "maxPriceToman": <integer upper market boundary in Toman>,
  "marketNotesFa": "<توضیحات کوتاه ۲ الی ۳ جمله‌ای به زبان فارسی درباره وضعیت قیمت روز در بازار ایران، نوسانات و علت نرخ>",
  "marketNotesEn": "<Short 2-sentence market explanation in English regarding current dockside and retail market rates>"
}`;

    for (const model of GEMINI_FLASH_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.15,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (!response.ok) continue;
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) continue;

        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        const parsed = JSON.parse(cleaned);

        if (parsed.pricePerKgToman && parsed.pricePerKgToman > 1000) {
          const aiPrice: AiFishPrice = {
            speciesId: fish.id,
            pricePerKgToman: Math.round(parsed.pricePerKgToman),
            pricePerKgUsd: Math.round((parsed.pricePerKgUsd || parsed.pricePerKgToman / 85000) * 10) / 10,
            minPriceToman: Math.round(parsed.minPriceToman || parsed.pricePerKgToman * 0.8),
            maxPriceToman: Math.round(parsed.maxPriceToman || parsed.pricePerKgToman * 1.25),
            marketNotesFa: parsed.marketNotesFa || 'برآورد نرخ روز بازار با هوش مصنوعی',
            marketNotesEn: parsed.marketNotesEn || 'AI-estimated current market benchmark',
            lastUpdated: Date.now(),
            isAiEstimated: true,
          };

          await this.saveAiPrice(aiPrice);
          return aiPrice;
        }
      } catch {
        // Continue to fallback model
      }
    }

    return this.getPriceForSpecies(fish.id);
  }

  /**
   * Fetches real-time market pricing for multiple species in a single batch request to Gemini.
   */
  static async fetchBatchPricesWithAi(speciesList: FishSpecies[]): Promise<Record<string, AiFishPrice>> {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) {
      return this.getAllCachedPrices();
    }

    const speciesPromptItems = speciesList.slice(0, 15).map((f) => ({
      id: f.id,
      nameFa: f.nameFa,
      nameEn: f.nameEn,
    }));

    const prompt = `You are a senior seafood market pricing economist in Iran.
Provide current realistic commercial market prices per kg in Iranian Toman and USD for these fish:
${JSON.stringify(speciesPromptItems, null, 1)}

Return JSON array:
[
  {
    "speciesId": "string",
    "pricePerKgToman": number,
    "pricePerKgUsd": number,
    "minPriceToman": number,
    "maxPriceToman": number,
    "marketNotesFa": "توضیح بازار به فارسی",
    "marketNotesEn": "Market note in English"
  }
]
Output ONLY raw JSON.`;

    for (const model of GEMINI_FLASH_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.15,
              response_mime_type: 'application/json',
            },
          }),
        });

        if (!response.ok) continue;
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) continue;

        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        const parsedArray = JSON.parse(cleaned);

        if (Array.isArray(parsedArray)) {
          const all = await this.getAllCachedPrices();
          const now = Date.now();
          for (const item of parsedArray) {
            if (item.speciesId && item.pricePerKgToman) {
              all[item.speciesId] = {
                speciesId: item.speciesId,
                pricePerKgToman: Math.round(item.pricePerKgToman),
                pricePerKgUsd: Math.round((item.pricePerKgUsd || item.pricePerKgToman / 85000) * 10) / 10,
                minPriceToman: Math.round(item.minPriceToman || item.pricePerKgToman * 0.8),
                maxPriceToman: Math.round(item.maxPriceToman || item.pricePerKgToman * 1.25),
                marketNotesFa: item.marketNotesFa || 'برآورد هوش مصنوعی بازار',
                marketNotesEn: item.marketNotesEn || 'AI market estimate',
                lastUpdated: now,
                isAiEstimated: true,
              };
            }
          }

          this.memoryCache = all;
          await this.persistCache(all);
          return all;
        }
      } catch {
        // Next model
      }
    }

    return this.getAllCachedPrices();
  }
}

export interface FreshnessInput {
  eyeState: 'prime' | 'good' | 'poor';
  gillState: 'prime' | 'good' | 'poor';
  skinState: 'prime' | 'good' | 'poor';
  fleshState: 'prime' | 'good' | 'poor';
}

export interface FreshnessResult {
  score: number; // 0 to 100
  grade: 'A' | 'B' | 'C' | 'D';
  gradeTitleEn: string;
  gradeTitleFa: string;
  summaryEn: string;
  summaryFa: string;
  badgeColor: string;
  culinaryVerdictEn: string;
  culinaryVerdictFa: string;
  scoresBreakdown: {
    eyes: number; // max 25
    gills: number; // max 30
    skin: number; // max 25
    flesh: number; // max 20
  };
  aiObservations?: {
    eyesFa?: string;
    eyesEn?: string;
    gillsFa?: string;
    gillsEn?: string;
    skinFa?: string;
    skinEn?: string;
    fleshFa?: string;
    fleshEn?: string;
    daysOnIceFa?: string;
    daysOnIceEn?: string;
    aiSummaryFa?: string;
    aiSummaryEn?: string;
    aiCulinaryVerdictFa?: string;
    aiCulinaryVerdictEn?: string;
  };
  isAiEvaluated?: boolean;
}

export function calculateFreshness(
  input: FreshnessInput,
  aiObservations?: FreshnessResult['aiObservations'],
  overrideScore?: number
): FreshnessResult {
  const eyeScores = { prime: 25, good: 16, poor: 4 };
  const gillScores = { prime: 30, good: 18, poor: 2 };
  const skinScores = { prime: 25, good: 15, poor: 4 };
  const fleshScores = { prime: 20, good: 12, poor: 2 };

  const eye = eyeScores[input.eyeState];
  const gill = gillScores[input.gillState];
  const skin = skinScores[input.skinState];
  const flesh = fleshScores[input.fleshState];

  const calculatedScore = eye + gill + skin + flesh;
  const totalScore = overrideScore !== undefined ? overrideScore : calculatedScore;
  const isAi = !!aiObservations;

  let res: FreshnessResult;

  if (totalScore >= 85) {
    res = {
      score: totalScore,
      grade: 'A',
      gradeTitleEn: 'Grade A - Prime Fresh Catch',
      gradeTitleFa: 'درجه A - صید روز و کاملاً تازه',
      summaryEn: aiObservations?.aiSummaryEn || 'Exemplary ocean-fresh quality. Bulging clear eyes and crimson gills indicate caught within the last 12-24 hours.',
      summaryFa: aiObservations?.aiSummaryFa || 'کیفیت فوق‌العاده صید روز. چشمان برجسته و آبشش یاقوتی نشانه صید حداکثر در ۲۴ ساعت گذشته است.',
      badgeColor: '#10B981',
      culinaryVerdictEn: aiObservations?.aiCulinaryVerdictEn || 'Perfect for all fine cooking: delicate grilling, sashimi/ceviche (if frozen per safety), pan searing, and royal Sabzi Polo.',
      culinaryVerdictFa: aiObservations?.aiCulinaryVerdictFa || 'عالی برای تمام مصارف اصیل: کباب زغالی، سبزی‌پلو مجلسی، سرخ‌کردنی ترد و بخارپز رژیمی.',
      scoresBreakdown: { eyes: eye, gills: gill, skin: skin, flesh: flesh },
      aiObservations,
      isAiEvaluated: isAi,
    };
  } else if (totalScore >= 70) {
    res = {
      score: totalScore,
      grade: 'B',
      gradeTitleEn: 'Grade B - Fresh & Good Condition',
      gradeTitleFa: 'درجه B - تازه و مرغوب بازاری',
      summaryEn: aiObservations?.aiSummaryEn || 'Very good commercial market condition. Well iced with natural clean smell and firm flesh.',
      summaryFa: aiObservations?.aiSummaryFa || 'شرایط بازاری بسیار خوب و یخ‌گیری مناسب. بوی طبیعی دریا و بافت کاملاً سالم و ارتجاعی.',
      badgeColor: '#0284C7',
      culinaryVerdictEn: aiObservations?.aiCulinaryVerdictEn || 'Excellent for traditional frying, Qalieh Mahi stew, and oven baking with lemon and herbs.',
      culinaryVerdictFa: aiObservations?.aiCulinaryVerdictFa || 'بسیار عالی برای قلیه ماهی سنتی، سرخ‌کردنی با ادویه جنوبی و تنوری شکم‌پر در فر.',
      scoresBreakdown: { eyes: eye, gills: gill, skin: skin, flesh: flesh },
      aiObservations,
      isAiEvaluated: isAi,
    };
  } else if (totalScore >= 50) {
    res = {
      score: totalScore,
      grade: 'C',
      gradeTitleEn: 'Grade C - Acceptable / Fair',
      gradeTitleFa: 'درجه C - کیفیت متوسط (مصرف فوری)',
      summaryEn: aiObservations?.aiSummaryEn || 'Mild storage fatigue observed. Cornea slightly flattened and skin sheen subdued. Safe if cooked thoroughly today.',
      summaryFa: aiObservations?.aiSummaryFa || 'کاهش نسبی رطوبت و درخشش پوست ناشی از نگهداری چندروزه در یخ. نیازمند شستشوی دقیق و مصرف فوری.',
      badgeColor: '#F59E0B',
      culinaryVerdictEn: aiObservations?.aiCulinaryVerdictEn || 'Cook thoroughly today. Best used in robust stews (Qalieh Mahi) with garlic, tamarind, and warming spices.',
      culinaryVerdictFa: aiObservations?.aiCulinaryVerdictFa || 'حتماً امروز پخته شود. مناسب خورش‌های پرچاشنی مانند قلیه ماهی با سیر، تمبر هندی و سبزی فراوان.',
      scoresBreakdown: { eyes: eye, gills: gill, skin: skin, flesh: flesh },
      aiObservations,
      isAiEvaluated: isAi,
    };
  } else {
    res = {
      score: totalScore,
      grade: 'D',
      gradeTitleEn: 'Grade D - Stale / Spoiled',
      gradeTitleFa: 'درجه D - کهنه و غیرقابل مصرف',
      summaryEn: aiObservations?.aiSummaryEn || 'Significant spoilage markers: sunken cloudy eyes, faded brownish gills, or soft indented flesh. Food safety hazard.',
      summaryFa: aiObservations?.aiSummaryFa || 'علائم آشکار فساد باکتریایی: چشمان کدر فرورفته، آبشش قهوه‌ای لزج و گوشت لهیده. از خرید یا مصرف آن خودداری کنید.',
      badgeColor: '#EF4444',
      culinaryVerdictEn: aiObservations?.aiCulinaryVerdictEn || 'DO NOT CONSUME. Risk of histamine toxicity or food poisoning. Return or discard.',
      culinaryVerdictFa: aiObservations?.aiCulinaryVerdictFa || 'غیرقابل مصرف بهداشتی. خطر مسمومیت غذایی. به هیچ وجه خریداری یا طبخ نگردد.',
      scoresBreakdown: { eyes: eye, gills: gill, skin: skin, flesh: flesh },
      aiObservations,
      isAiEvaluated: isAi,
    };
  }

  return res;
}

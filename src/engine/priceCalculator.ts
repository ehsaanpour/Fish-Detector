export interface PriceCalculationResult {
  grossWeightKg: number;
  netWeightKg: number; // approx 82% after gutting and scaling
  pricePerKgToman: number;
  pricePerKgUsd: number;
  totalToman: number;
  totalUsd: number;
  savingTipsFa: string;
  savingTipsEn: string;
}

export function calculateFishCost(
  weightGrams: number,
  pricePerKgToman: number,
  pricePerKgUsd: number
): PriceCalculationResult {
  const grossWeightKg = Math.max(0, weightGrams) / 1000;
  const netWeightKg = Math.round(grossWeightKg * 0.82 * 100) / 100;

  const totalToman = Math.round(grossWeightKg * pricePerKgToman);
  const totalUsd = Math.round(grossWeightKg * pricePerKgUsd * 100) / 100;

  return {
    grossWeightKg,
    netWeightKg,
    pricePerKgToman,
    pricePerKgUsd,
    totalToman,
    totalUsd,
    savingTipsEn: 'Gross scale weight reduces by ~18% after removing guts and scales. Clean fillets yield ~80-85% usable meat.',
    savingTipsFa: 'تمیز کردن و دورریز شکم معمولاً حدود ۱۸٪ از وزن اولیه کسر می‌کند. گوشت خالص مفید حدود ۸۰ تا ۸۵ درصد خواهد بود.',
  };
}

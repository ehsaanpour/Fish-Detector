import { GeminiPricingService } from '../src/engine/ai/geminiPricingService';
import { ALL_FISH_SPECIES } from '../src/database/seedData';
import { calculateFishCost } from '../src/engine/priceCalculator';

async function testPricingEngine() {
  console.log('--- TESTING GEMINI AI PRICING ENGINE ---');

  // Test 1: Fetch initial benchmarks
  const allCached = await GeminiPricingService.getAllCachedPrices();
  console.log(`[TEST 1] Loaded cached/initial AI benchmarks: ${Object.keys(allCached).length} species`);
  if (Object.keys(allCached).length === 0) {
    throw new Error('Expected initial AI pricing benchmarks');
  }
  console.log('✅ Passed: Benchmark cache loaded.');

  // Test 2: Verify high-value fish rates (e.g. Zobaidi, Shir, Hamour)
  const zobaidiPrice = await GeminiPricingService.getPriceForSpecies('zobaidi');
  console.log(`[TEST 2] Zobaidi (زبیدی) AI price per kg: ${zobaidiPrice?.pricePerKgToman.toLocaleString()} Toman ($${zobaidiPrice?.pricePerKgUsd})`);
  console.log(`          Range: ${zobaidiPrice?.minPriceToman.toLocaleString()} - ${zobaidiPrice?.maxPriceToman.toLocaleString()} Toman`);
  console.log(`          Notes: ${zobaidiPrice?.marketNotesFa}`);
  if (!zobaidiPrice || zobaidiPrice.pricePerKgToman < 900000) {
    throw new Error('Zobaidi AI price should reflect realistic Iranian market benchmark (>900,000 Toman)');
  }
  console.log('✅ Passed: Realistic market rate benchmark verified.');

  // Test 3: Weight-to-cost calculation using AI price
  const shirPrice = await GeminiPricingService.getPriceForSpecies('shir');
  if (!shirPrice) throw new Error('Shir price not found');
  const weightGrams = 2000; // 2kg
  const costResult = calculateFishCost(weightGrams, shirPrice.pricePerKgToman, shirPrice.pricePerKgUsd);
  console.log(`[TEST 3] 2kg Shir Cost Calculation: ${costResult.totalToman.toLocaleString()} Toman ($${costResult.totalUsd})`);
  console.log(`          Gross weight: ${costResult.grossWeightKg}kg, Clean net meat: ${costResult.netWeightKg}kg`);
  if (costResult.totalToman !== shirPrice.pricePerKgToman * 2) {
    throw new Error('Cost calculation mismatch');
  }
  console.log('✅ Passed: Weight cost calculation using AI price accurate.');

  // Test 4: Verify sync benchmark getter
  const hamourSync = GeminiPricingService.getCachedPriceSync('hamour');
  console.log(`[TEST 4] Hamour (هامور) sync price: ${hamourSync?.pricePerKgToman.toLocaleString()} Toman`);
  if (!hamourSync) {
    throw new Error('Expected sync price for hamour');
  }
  console.log('✅ Passed: Sync benchmark retrieval works.');

  console.log('🎉 ALL AI PRICING TESTS PASSED SUCCESSFULLY!');
}

testPricingEngine().catch((err) => {
  console.error('Pricing test failed:', err);
  process.exit(1);
});

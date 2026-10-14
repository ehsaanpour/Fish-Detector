import { ALL_FISH_SPECIES } from '../src/database/seedData';
import { dbService } from '../src/database/dbService';
import { calculateFreshness } from '../src/engine/freshnessGrader';
import { calculateFishCost } from '../src/engine/priceCalculator';

console.log('--- RUNNING MARKET FISH INSPECTOR VERIFICATION SUITE ---');

// 1. Verify Database Seed Data Count & Coverage
console.log(`[TEST 1] Verifying Fish Database Count...`);
if (ALL_FISH_SPECIES.length < 35) {
  throw new Error(`Expected at least 35 species, got ${ALL_FISH_SPECIES.length}`);
}
console.log(`✅ Passed: ${ALL_FISH_SPECIES.length} commercial fish species loaded.`);

// Verify Persian Gulf Species have Southern Dialect Names
const persianGulfFish = ALL_FISH_SPECIES.filter((s) => s.category === 'persian_gulf');
console.log(`[TEST 2] Verifying Persian Gulf Species (${persianGulfFish.length} species)...`);
for (const fish of persianGulfFish) {
  if (!fish.regionalNames || fish.regionalNames.length === 0) {
    throw new Error(`Persian Gulf fish ${fish.id} missing southern dialect names!`);
  }
}
console.log(`✅ Passed: All ${persianGulfFish.length} Persian Gulf species include Southern dialect nomenclature.`);

// Verify Multi-Dialect Search
console.log(`[TEST 3] Verifying Multi-Dialect Search Engine...`);
const searchZobaidi = dbService.searchSpecies('زبیدی');
if (searchZobaidi.length === 0 || !searchZobaidi.some((s) => s.id === 'zobaidi')) {
  throw new Error('Search for dialect "زبیدی" failed to return Silver Pomfret!');
}
const searchShir = dbService.searchSpecies('ماهی شیر');
if (searchShir.length === 0 || !searchShir.some((s) => s.id === 'shir')) {
  throw new Error('Search for "ماهی شیر" failed!');
}
console.log(`✅ Passed: Multi-dialect search returns accurate matches.`);

// 2. Verify Freshness Grader Algorithm
console.log(`[TEST 4] Verifying 4-Point Freshness Grader Algorithm...`);
const primeResult = calculateFreshness({
  eyeState: 'prime',
  gillState: 'prime',
  skinState: 'prime',
  fleshState: 'prime',
});
if (primeResult.score !== 100 || primeResult.grade !== 'A') {
  throw new Error(`Expected score 100 Grade A, got ${primeResult.score} Grade ${primeResult.grade}`);
}

const spoiledResult = calculateFreshness({
  eyeState: 'poor',
  gillState: 'poor',
  skinState: 'poor',
  fleshState: 'poor',
});
if (spoiledResult.score > 40 || spoiledResult.grade !== 'D') {
  throw new Error(`Expected Grade D for spoiled condition, got ${spoiledResult.score} Grade ${spoiledResult.grade}`);
}
console.log(`✅ Passed: Freshness engine correctly grades Prime (100% Grade A) and Spoiled (${spoiledResult.score}% Grade D).`);

// 3. Verify Weight-to-Price Engine
console.log(`[TEST 5] Verifying Weight-to-Price Engine...`);
const costCalc = calculateFishCost(1500, 1000000, 12);
if (costCalc.grossWeightKg !== 1.5 || costCalc.totalToman !== 1500000) {
  throw new Error(`Price calculation failed: ${JSON.stringify(costCalc)}`);
}
console.log(`✅ Passed: Weight calculation accurate (1500g = 1.5kg, 1,500,000 Toman, Net yield: ${costCalc.netWeightKg}kg).`);

console.log('--- ALL VERIFICATION SUITE TESTS PASSED SUCCESSFULLY! ---');

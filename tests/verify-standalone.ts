import { ALL_FISH_SPECIES } from '../src/database/seedData';
import { calculateFreshness } from '../src/engine/freshnessGrader';
import { calculateFishCost } from '../src/engine/priceCalculator';

console.log('======================================================');
console.log('  MARKET FISH INSPECTOR - CORE VERIFICATION SUITE');
console.log('======================================================\n');

// 1. Verify Species Catalog Count
console.log(`[TEST 1] Verifying Total Fish Species Count...`);
if (!ALL_FISH_SPECIES || ALL_FISH_SPECIES.length < 35) {
  throw new Error(`Expected at least 35 species, found ${ALL_FISH_SPECIES?.length}`);
}
console.log(`  ✅ PASSED: ${ALL_FISH_SPECIES.length} commercial fish species loaded natively offline.`);

// 2. Verify Persian Gulf Species & Southern Regional Dialects
console.log(`\n[TEST 2] Verifying Persian Gulf & Southern Dialect Nomenclature...`);
const pgSpecies = ALL_FISH_SPECIES.filter(s => s.category === 'persian_gulf');
console.log(`  Found ${pgSpecies.length} Persian Gulf / Oman Sea species.`);
for (const fish of pgSpecies) {
  if (!fish.regionalNames || fish.regionalNames.length === 0) {
    throw new Error(`Fish "${fish.id}" is missing Southern regional names!`);
  }
}
console.log(`  ✅ PASSED: All ${pgSpecies.length} Persian Gulf species include Southern dialect nomenclature.`);
console.log(`  Sample: Zobaidi dialects -> ${JSON.stringify(pgSpecies[0].regionalNames.map(r => `${r.regionFa}: ${r.dialectName}`))}`);

// 3. Verify Dialect Search Functionality
console.log(`\n[TEST 3] Verifying Dialect Search Engine...`);
const searchDialect = (query: string) => {
  const q = query.trim().toLowerCase();
  return ALL_FISH_SPECIES.filter(fish =>
    fish.nameEn.toLowerCase().includes(q) ||
    fish.nameFa.includes(q) ||
    fish.scientificName.toLowerCase().includes(q) ||
    fish.regionalNames.some(r => r.dialectName.toLowerCase().includes(q) || r.regionFa.includes(q))
  );
};

const zobaidiMatches = searchDialect('زبیدی');
if (zobaidiMatches.length === 0 || !zobaidiMatches.some(f => f.id === 'zobaidi')) {
  throw new Error('Search for dialect "زبیدی" failed to return Silver Pomfret!');
}
console.log(`  ✅ PASSED: Searching "زبیدی" matched: ${zobaidiMatches[0].nameFa} (${zobaidiMatches[0].nameEn}).`);

const rashgooMatches = searchDialect('راشگو');
if (rashgooMatches.length === 0 || !rashgooMatches.some(f => f.id === 'rashgoo')) {
  throw new Error('Search for dialect "راشگو" failed!');
}
console.log(`  ✅ PASSED: Searching "راشگو" matched: ${rashgooMatches[0].nameFa} (${rashgooMatches[0].nameEn}).`);

// 4. Verify Freshness Scoring Engine
console.log(`\n[TEST 4] Verifying 4-Point Freshness Grader Algorithm...`);
const primeGrading = calculateFreshness({
  eyeState: 'prime',
  gillState: 'prime',
  skinState: 'prime',
  fleshState: 'prime'
});
if (primeGrading.score !== 100 || primeGrading.grade !== 'A') {
  throw new Error(`Expected 100% Grade A, got ${primeGrading.score}% Grade ${primeGrading.grade}`);
}
console.log(`  ✅ PASSED: Prime fish graded 100% Grade A (${primeGrading.gradeTitleFa}).`);

const staleGrading = calculateFreshness({
  eyeState: 'poor',
  gillState: 'poor',
  skinState: 'poor',
  fleshState: 'poor'
});
if (staleGrading.grade !== 'D' || staleGrading.score > 40) {
  throw new Error(`Expected Grade D for stale fish, got ${staleGrading.score}% Grade ${staleGrading.grade}`);
}
console.log(`  ✅ PASSED: Stale fish correctly identified as Grade D (${staleGrading.score}% - ${staleGrading.gradeTitleFa}).`);

// 5. Verify Weight-to-Price Engine
console.log(`\n[TEST 5] Verifying Market Pricing & Weight Yield Calculator...`);
const costResult = calculateFishCost(2000, 1150000, 14.5); // 2kg of Zobaidi
if (costResult.grossWeightKg !== 2.0 || costResult.totalToman !== 2300000) {
  throw new Error(`Cost calculation error: ${JSON.stringify(costResult)}`);
}
console.log(`  ✅ PASSED: 2000g Zobaidi = 2.0kg gross, ${costResult.totalToman.toLocaleString()} Toman total ($${costResult.totalUsd}).`);
console.log(`  Estimated net fillet meat: ${costResult.netWeightKg} kg.`);

console.log('\n======================================================');
console.log('  🎉 ALL CORE ENGINES & DATA VERIFICATIONS PASSED! 🎉');
console.log('======================================================\n');

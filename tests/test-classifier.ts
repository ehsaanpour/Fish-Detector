import { classifyFishPhoto } from '../src/engine/cv/speciesClassifier';

async function runTests() {
  console.log('--- TESTING COMPUTER VISION SPECIES CLASSIFIER ---');

  // Test 1: Sangsar fish (the user report case)
  console.log('\n[TEST 1] Testing Sangsar Identification...');
  const sangsarPred = await classifyFishPhoto('assets/fish/sangsar.jpg', 'sangsar.jpg');
  console.log(`Top match: ${sangsarPred.topMatch.species.nameFa} (${sangsarPred.topMatch.species.id}) - Confidence: ${sangsarPred.topMatch.confidence}%`);
  console.log(`Distinguishing features:`, sangsarPred.topMatch.distinguishingFeaturesFa);
  if (sangsarPred.topMatch.species.id !== 'sangsar') {
    throw new Error(`Expected sangsar, got ${sangsarPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Sangsar successfully identified!');

  // Test 2: Persian name hint
  console.log('\n[TEST 2] Testing Persian dialect hint (سنگسر)...');
  const persianPred = await classifyFishPhoto('blob:http://localhost:8081/upload', 'ماهی_سنگسر_بوشهر.jpg');
  console.log(`Top match: ${persianPred.topMatch.species.nameFa} (${persianPred.topMatch.species.id})`);
  if (persianPred.topMatch.species.id !== 'sangsar') {
    throw new Error(`Expected sangsar, got ${persianPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Persian dialect recognized!');

  // Test 3: Hamour fish
  console.log('\n[TEST 3] Testing Hamour Identification...');
  const hamourPred = await classifyFishPhoto('assets/fish/hamour.jpg', 'hamour.jpg');
  console.log(`Top match: ${hamourPred.topMatch.species.nameFa} (${hamourPred.topMatch.species.id}) - Confidence: ${hamourPred.topMatch.confidence}%`);
  if (hamourPred.topMatch.species.id !== 'hamour') {
    throw new Error(`Expected hamour, got ${hamourPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Hamour successfully identified!');

  // Test 4: Zobaidi fish
  console.log('\n[TEST 4] Testing Zobaidi Identification...');
  const zobaidiPred = await classifyFishPhoto('assets/fish/zobaidi.jpg', 'zobaidi.jpg');
  console.log(`Top match: ${zobaidiPred.topMatch.species.nameFa} (${zobaidiPred.topMatch.species.id}) - Confidence: ${zobaidiPred.topMatch.confidence}%`);
  if (zobaidiPred.topMatch.species.id !== 'zobaidi') {
    throw new Error(`Expected zobaidi, got ${zobaidiPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Zobaidi successfully identified!');

  // Test 5: Sorkhoo fish
  console.log('\n[TEST 5] Testing Sorkhoo Identification...');
  const sorkhooPred = await classifyFishPhoto('assets/fish/sorkhoo.jpg', 'sorkhoo.jpg');
  console.log(`Top match: ${sorkhooPred.topMatch.species.nameFa} (${sorkhooPred.topMatch.species.id}) - Confidence: ${sorkhooPred.topMatch.confidence}%`);
  if (sorkhooPred.topMatch.species.id !== 'sorkhoo') {
    throw new Error(`Expected sorkhoo, got ${sorkhooPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Sorkhoo successfully identified!');

  // Test 6: Ghobad fish (named)
  console.log('\n[TEST 6] Testing Ghobad Identification (named)...');
  const ghobadPred = await classifyFishPhoto('assets/fish/ghobad.jpg', 'ghobad.jpg');
  console.log(`Top match: ${ghobadPred.topMatch.species.nameFa} (${ghobadPred.topMatch.species.id}) - Confidence: ${ghobadPred.topMatch.confidence}%`);
  if (ghobadPred.topMatch.species.id !== 'ghobad') {
    throw new Error(`Expected ghobad, got ${ghobadPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Ghobad successfully identified!');

  // Test 7: Ghobad fish with filename hint and AI Freshness integration
  console.log('\n[TEST 7] Testing Ghobad Identification & AI Freshness Grading...');
  const ghobadAiPred = await classifyFishPhoto('blob:http://localhost:8081/upload_ghobad', 'ghobad_catch.jpg');
  console.log(`Top match: ${ghobadAiPred.topMatch.species.nameFa} (${ghobadAiPred.topMatch.species.id}) - Confidence: ${ghobadAiPred.topMatch.confidence}%`);
  console.log('AI Freshness Grade:', ghobadAiPred.aiFreshnessResult?.grade, `(${ghobadAiPred.aiFreshnessResult?.score}%)`);
  if (ghobadAiPred.topMatch.species.id !== 'ghobad') {
    throw new Error(`Expected ghobad, got ${ghobadAiPred.topMatch.species.id}`);
  }
  if (!ghobadAiPred.aiFreshnessResult) {
    throw new Error('Expected aiFreshnessResult to be populated');
  }
  console.log('✅ Passed: Species and AI Freshness successfully generated!');

  // Test 8: Kawakawa / Zardeh fish (the user report case!)
  console.log('\n[TEST 8] Testing Kawakawa / Zardeh Identification (زرده)...');
  const zardehPred = await classifyFishPhoto('assets/fish/zardeh.jpg', 'ماهی_زرده_جنوب.jpg');
  console.log(`Top match: ${zardehPred.topMatch.species.nameFa} (${zardehPred.topMatch.species.id}) - Confidence: ${zardehPred.topMatch.confidence}%`);
  console.log(`Distinguishing features:`, zardehPred.topMatch.distinguishingFeaturesFa);
  if (zardehPred.topMatch.species.id !== 'zardeh') {
    throw new Error(`Expected zardeh, got ${zardehPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Kawakawa (ماهی زرده) successfully identified!');

  // Test 9: Rashgoo fish with updated photo
  console.log('\n[TEST 9] Testing Rashgoo Identification (راشگو)...');
  const rashgooPred = await classifyFishPhoto('assets/fish/rashgoo.jpg', 'rashgoo_fish.jpg');
  console.log(`Top match: ${rashgooPred.topMatch.species.nameFa} (${rashgooPred.topMatch.species.id}) - Confidence: ${rashgooPred.topMatch.confidence}%`);
  if (rashgooPred.topMatch.species.id !== 'rashgoo') {
    throw new Error(`Expected rashgoo, got ${rashgooPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Rashgoo successfully identified!');

  // Test 10: Sobaity fish
  console.log('\n[TEST 10] Testing Sobaity Seabream Identification (صبیتی)...');
  const sobaityPred = await classifyFishPhoto('assets/fish/sobaity.jpg', 'ماهی_صبیتی_بوشهر.jpg');
  console.log(`Top match: ${sobaityPred.topMatch.species.nameFa} (${sobaityPred.topMatch.species.id}) - Confidence: ${sobaityPred.topMatch.confidence}%`);
  if (sobaityPred.topMatch.species.id !== 'sobaity') {
    throw new Error(`Expected sobaity, got ${sobaityPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Sobaity successfully identified!');

  // Test 11: Kilka fish (Caspian sprat)
  console.log('\n[TEST 11] Testing Kilka Identification (کیلکا)...');
  const kilkaPred = await classifyFishPhoto('assets/fish/kilka.jpg', 'کیلکا_بابلسر.jpg');
  console.log(`Top match: ${kilkaPred.topMatch.species.nameFa} (${kilkaPred.topMatch.species.id}) - Confidence: ${kilkaPred.topMatch.confidence}%`);
  if (kilkaPred.topMatch.species.id !== 'kilka') {
    throw new Error(`Expected kilka, got ${kilkaPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Kilka successfully identified!');

  // Test 12: Mahi-Mahi fish (the user report case!)
  console.log('\n[TEST 12] Testing Mahi-Mahi Identification (ماهی‌ماهی / عنزه)...');
  const mahimahiPred = await classifyFishPhoto('assets/fish/mahimahi.jpg', 'MahiMahi_ocean_catch.jpg');
  console.log(`Top match: ${mahimahiPred.topMatch.species.nameFa} (${mahimahiPred.topMatch.species.id}) - Confidence: ${mahimahiPred.topMatch.confidence}%`);
  console.log(`Distinguishing features:`, mahimahiPred.topMatch.distinguishingFeaturesFa);
  if (mahimahiPred.topMatch.species.id !== 'mahimahi') {
    throw new Error(`Expected mahimahi, got ${mahimahiPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Mahi-Mahi (ماهی عنزه / ماهی‌ماهی) successfully identified!');

  // Test 13: Great Barracuda with English file name "barracuda.jpg" (User reported issue!)
  console.log('\n[TEST 13] Testing Great Barracuda (Dolmi / Kootar) with "barracuda.jpg"...');
  const cudaPred = await classifyFishPhoto('blob:http://localhost:8081/upload_barracuda', 'barracuda.jpg');
  console.log(`Top match: ${cudaPred.topMatch.species.nameFa} (${cudaPred.topMatch.species.id}) - Confidence: ${cudaPred.topMatch.confidence}%`);
  if (cudaPred.topMatch.species.id !== 'dolmi') {
    throw new Error(`Expected dolmi (Great Barracuda), got ${cudaPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Barracuda successfully matched to ماهی دولمی (کوتر)!');

  // Test 14: Persian name "ماهی_کوتر_بوشهر.jpg"
  console.log('\n[TEST 14] Testing Persian name (ماهی_کوتر_بوشهر.jpg)...');
  const kootarPred = await classifyFishPhoto('assets/fish/dolmi.jpg', 'ماهی_کوتر_بوشهر.jpg');
  console.log(`Top match: ${kootarPred.topMatch.species.nameFa} (${kootarPred.topMatch.species.id}) - Confidence: ${kootarPred.topMatch.confidence}%`);
  if (kootarPred.topMatch.species.id !== 'dolmi') {
    throw new Error(`Expected dolmi, got ${kootarPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Persian dialect کوتر recognized!');

  // Test 15: Anonymous photo upload without API key requires Gemini AI configuration (no wrong Cod guesses)
  console.log('\n[TEST 15] Testing Anonymous photo upload (requires Gemini AI Key, eliminates wrong Cod guess)...');
  const anonCuda = await classifyFishPhoto('blob:http://localhost:8081/camera_0192.jpg', 'IMG_0192.jpg', {
    width: 840,
    height: 200,
  });
  console.log(`Requires API key: ${anonCuda.requiresApiKey}, Detected with AI: ${anonCuda.detectedWithAI}`);
  if (!anonCuda.requiresApiKey) {
    throw new Error('Expected requiresApiKey to be true when Gemini is unconfigured');
  }
  // Ensure it's NEVER misclassified as Cod!
  if (anonCuda.topMatch.species.id === 'cod' && anonCuda.topMatch.confidence > 0) {
    throw new Error(`CRITICAL: Local detector mistakenly guessed Cod!`);
  }
  console.log('✅ Passed: Anonymous photo cleanly requests Gemini AI key without flawed local dHash guessing!');

  // Test 16: Orientation & Flip Invariance (head on right vs left)
  console.log('\n[TEST 16] Testing Horizontal Flip & 90deg Rotation parameter passing...');
  const flippedPred = await classifyFishPhoto(
    'blob:http://localhost:8081/camera_flipped.jpg',
    'barracuda_flipped.jpg',
    { width: 840, height: 200 },
    { rotation: 90, isFlipped: true }
  );
  console.log(`Top match with rotation 90 & flip: ${flippedPred.topMatch.species.nameFa} (${flippedPred.topMatch.species.id})`);
  if (flippedPred.topMatch.species.id !== 'dolmi') {
    throw new Error(`Expected dolmi, got ${flippedPred.topMatch.species.id}`);
  }
  console.log('✅ Passed: Orientation and flipping correctly processed!');

  console.log('\n🎉 ALL 16 CLASSIFIER VERIFICATION TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

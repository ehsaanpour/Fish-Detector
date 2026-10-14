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

  // Test 7: Ghobad fish (anonymous image with dimensions)
  console.log('\n[TEST 7] Testing Ghobad Identification (anonymous upload)...');
  const anonPred = await classifyFishPhoto('blob:http://localhost:8081/upload_random', 'camera_capture_1294.jpg', {
    width: 800,
    height: 320, // 2.5 aspect ratio, typical of Ghobad/mackerel
  });
  console.log(`Top match: ${anonPred.topMatch.species.nameFa} (${anonPred.topMatch.species.id}) - Confidence: ${anonPred.topMatch.confidence}%`);
  console.log('Alternatives:', anonPred.alternatives.map(a => `${a.species.nameFa} (${a.confidence}%)`));

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

  console.log('\n🎉 ALL 11 CLASSIFIER VERIFICATION TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

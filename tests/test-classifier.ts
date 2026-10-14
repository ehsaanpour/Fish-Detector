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

  console.log('\n🎉 ALL CLASSIFIER VERIFICATION TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

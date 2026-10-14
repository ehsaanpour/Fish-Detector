const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'fish');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const fishSources = [
  { key: 'zobaidi', url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Pampus_argenteus_1.jpg' },
  { key: 'halva_siah', url: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Parastromateus_niger_Pakistan.jpg' },
  { key: 'shir', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Narrow-barred_Spanish_Mackerel.jpg' },
  { key: 'ghobad', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Scomberomorus_guttatus.jpg' },
  { key: 'shoorideh', url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/OtolithRuberDinhDTran.jpg' },
  { key: 'sangsar', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Pomadasys_furcatus%2C_Pristipoma_furcatum.jpg' },
  { key: 'hamour', url: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Epinephelus_coioides_Thailand.jpg' },
  { key: 'shahri', url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Lethrinus_nebulosus_287497294_%28cropped%29.jpg' },
  { key: 'sorkhoo', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Lutjanus_lutjanus.JPG' },
  { key: 'rashgoo', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Eleutheronema_tetradactylum_Thomas.jpg' },
  { key: 'seebass_jonoob', url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Lates_calcarifer%2C_2014-09-19a.jpg' },
  { key: 'sakan', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Rachycentron_canadum_Robertson.jpg' },
  { key: 'hoor', url: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Thunnus_tonggol.jpg' },
  { key: 'zaminkan', url: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Platycephalus_indicusFB.png' },
  { key: 'shank', url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Acanthopagrus_latus_01.jpg' },
  { key: 'kharoo', url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Chirocentrus_dorab.jpg' },
  { key: 'dolmi', url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Gran_barracuda_%28Sphyraena_barracuda%29%2C_cayo_Campanario%2C_Cuba%2C_2014-04-12%2C_DD_09.JPG' },
  { key: 'sarem', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Scomberoides_commersonnianus.jpg' },
  { key: 'meyd', url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Sardinella_aurita.jpg' },
  { key: 'kutum', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Rutilus_frisii_gy%C3%B6ngy%C3%B6s_konc%C3%A9r.jpg' },
  { key: 'ghezelala', url: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Trout.jpg' },
  { key: 'kapoor', url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Cyprinus_carpio_2008_G1_%28cropped%29.jpg' },
  { key: 'souf', url: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Sander_lucioperca_1.jpg' },
  { key: 'ozonboron', url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Acipenser_stellatus_s%C5%91regtok.jpg' },
  { key: 'kefal_khazar', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chelon_labrosus.jpg' },
  { key: 'azad_khazar', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Salmo_trutta.jpg' },
  { key: 'atlantic_salmon', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Wst_atlantischer_lachs_stoer_001.jpg' },
  { key: 'cod', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg' },
  { key: 'tilapia', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Til%C3%A1pia_ou_Sarotherodon_niloticus_2.jpg' },
  { key: 'dorade', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Sparus_aurata%2C_Alpes-Maritimes%2C_Provence-Alpes-C%C3%B4te_d%27Azur%2C_FR.jpg' },
  { key: 'european_seabass', url: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Sealife%2C_Bray%2C_Ireland._%286985874900%29.jpg' },
  { key: 'yellowfin_tuna', url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Thunnus_albacares.png' },
  { key: 'swordfish', url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Xiphias_gladius_Linnaeus%2C_1758_2599925208.jpg' },
  { key: 'mackerel_sardine', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Scomber_scombrus_217326414.jpg' },
  { key: 'halibut', url: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Hippoglossus_hippoglossus_196509307.jpg' },
  { key: 'haddock', url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Haddock%2C_Boston_Aquarium.JPG' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FishDetectorMarketApp/1.0 (https://github.com/ehsaanpour/Fish-Detector; info@fishdetector.org)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          if (stats.size < 1000) {
            reject(new Error('File too small: ' + stats.size));
          } else {
            resolve(stats.size);
          }
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Starting download of ${fishSources.length} authentic fish images...`);
  let success = 0;
  let failed = 0;

  for (const item of fishSources) {
    const dest = path.join(targetDir, `${item.key}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`[EXISTS] ${item.key} (${fs.statSync(dest).size} bytes)`);
      success++;
      continue;
    }
    try {
      const size = await downloadFile(item.url, dest);
      console.log(`[OK] ${item.key}: downloaded (${size} bytes)`);
      success++;
    } catch (err) {
      console.error(`[FAIL] ${item.key}: ${err.message}`);
      failed++;
    }
  }

  console.log(`Finished: ${success} succeeded, ${failed} failed.`);
}

run();

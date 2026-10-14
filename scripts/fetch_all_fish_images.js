const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'assets', 'fish');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const allFish = [
  { key: 'zobaidi', wiki: 'Pampus argenteus', commons: 'Pampus argenteus' },
  { key: 'halva_siah', wiki: 'Parastromateus niger', commons: 'Parastromateus niger' },
  { key: 'shir', wiki: 'Narrow-barred Spanish mackerel', commons: 'Scomberomorus commerson' },
  { key: 'ghobad', wiki: 'Indo-Pacific king mackerel', commons: 'Scomberomorus guttatus' },
  { key: 'shoorideh', wiki: 'Tigertooth croaker', commons: 'Otolithes ruber' },
  { key: 'sangsar', wiki: 'Javelin grunter', commons: 'Pomadasys kaakan' },
  { key: 'hamour', wiki: 'Orange-spotted grouper', commons: 'Epinephelus coioides' },
  { key: 'shahri', wiki: 'Spangled emperor', commons: 'Lethrinus nebulosus' },
  { key: 'sorkhoo', wiki: 'Lutjanus erythropterus', commons: 'Lutjanus erythropterus' },
  { key: 'rashgoo', wiki: 'Fourfinger threadfin', commons: 'Eleutheronema tetradactylum' },
  { key: 'seebass_jonoob', wiki: 'Barramundi', commons: 'Lates calcarifer' },
  { key: 'sakan', wiki: 'Cobia', commons: 'Rachycentron canadum' },
  { key: 'hoor', wiki: 'Longtail tuna', commons: 'Thunnus tonggol' },
  { key: 'zaminkan', wiki: 'Bartail flathead', commons: 'Platycephalus indicus' },
  { key: 'shank', wiki: 'Acanthopagrus latus', commons: 'Acanthopagrus latus' },
  { key: 'kharoo', wiki: 'Dorab wolf-herring', commons: 'Chirocentrus dorab' },
  { key: 'dolmi', wiki: 'Great barracuda', commons: 'Sphyraena barracuda' },
  { key: 'sarem', wiki: 'Talang queenfish', commons: 'Scomberoides commersonnianus' },
  { key: 'meyd', wiki: 'Goldstripe sardinella', commons: 'Sardinella aurita' },
  { key: 'kutum', wiki: 'Caspian kutum', commons: 'Rutilus frisii' },
  { key: 'ghezelala', wiki: 'Rainbow trout', commons: 'Oncorhynchus mykiss' },
  { key: 'kapoor', wiki: 'Common carp', commons: 'Cyprinus carpio' },
  { key: 'souf', wiki: 'Zander', commons: 'Sander lucioperca' },
  { key: 'ozonboron', wiki: 'Starry sturgeon', commons: 'Acipenser stellatus' },
  { key: 'kefal_khazar', wiki: 'Thinlip mullet', commons: 'Chelon labrosus' },
  { key: 'azad_khazar', wiki: 'Brown trout', commons: 'Salmo trutta' },
  { key: 'atlantic_salmon', wiki: 'Atlantic salmon', commons: 'Salmo salar' },
  { key: 'cod', wiki: 'Atlantic cod', commons: 'Gadus morhua' },
  { key: 'tilapia', wiki: 'Nile tilapia', commons: 'Oreochromis niloticus' },
  { key: 'dorade', wiki: 'Gilt-head bream', commons: 'Sparus aurata' },
  { key: 'european_seabass', wiki: 'European seabass', commons: 'Dicentrarchus labrax' },
  { key: 'yellowfin_tuna', wiki: 'Yellowfin tuna', commons: 'Thunnus albacares' },
  { key: 'swordfish', wiki: 'Swordfish', commons: 'Xiphias gladius' },
  { key: 'mackerel_sardine', wiki: 'Atlantic mackerel', commons: 'Scomber scombrus' },
  { key: 'halibut', wiki: 'Atlantic halibut', commons: 'Hippoglossus hippoglossus' },
  { key: 'haddock', wiki: 'Haddock', commons: 'Melanogrammus aeglefinus' },
];

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'FishDetectorApp/1.0 (info@fishdetector.org)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'FishDetectorMarketApp/1.0 (https://github.com/ehsaanpour/Fish-Detector; info@fishdetector.org)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP Status ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          if (stats.size < 2000) {
            fs.unlinkSync(dest);
            reject(new Error('File too small (' + stats.size + ' bytes)'));
          } else {
            resolve(stats.size);
          }
        });
      });
    }).on('error', reject);
  });
}

async function resolveUrl(fish) {
  // 1. Wikipedia Page Image
  const wUrl = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(fish.wiki) + '&redirects=1&prop=pageimages&piprop=original&format=json';
  const wJson = await fetchJson(wUrl);
  if (wJson && wJson.query) {
    const page = Object.values(wJson.query.pages)[0];
    if (page && !page.missing) {
      const src = page.original?.source;
      if (src && !src.endsWith('.svg') && !src.endsWith('.gif') && !src.toLowerCase().includes('drawing') && !src.toLowerCase().includes('map')) {
        return src;
      }
    }
  }

  // 2. Wikimedia Search
  const cUrl = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(fish.commons) + '&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json';
  const cJson = await fetchJson(cUrl);
  if (cJson && cJson.query) {
    const pages = Object.values(cJson.query.pages);
    const match = pages.find(p => {
      const u = (p.imageinfo?.[0]?.url || '').split('?')[0].toLowerCase();
      const t = p.title.toLowerCase();
      return (u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png')) &&
        !t.includes('drawing') && !t.includes('day') && !t.includes('stamp') && !t.includes('map');
    });
    if (match) return match.imageinfo[0].url.split('?')[0];
  }

  return null;
}

async function run() {
  console.log(`Checking and downloading ${allFish.length} fish species...`);
  let success = 0;
  let failed = 0;

  for (const fish of allFish) {
    const dest = path.join(targetDir, `${fish.key}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`[ALREADY_OK] ${fish.key} (${fs.statSync(dest).size} bytes)`);
      success++;
      continue;
    }

    try {
      const url = await resolveUrl(fish);
      if (!url) {
        console.error(`[NOT_FOUND] ${fish.key}`);
        failed++;
        continue;
      }
      const size = await downloadFile(url, dest);
      console.log(`[DOWNLOADED] ${fish.key} from ${url.split('/').pop().substring(0, 30)} (${size} bytes)`);
      success++;
    } catch (err) {
      console.error(`[ERROR] ${fish.key}: ${err.message}`);
      failed++;
    }
  }

  console.log(`Done: ${success} present, ${failed} failed.`);
}

run();

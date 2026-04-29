/**
 * One-time migration: load data/products.json → Upstash Redis
 * Run: node scripts/migrate-to-redis.js
 */

const fs   = require('fs');
const path = require('path');

// Load env from .env.local (manually, no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    });
}

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('❌  Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env.local');
  process.exit(1);
}

async function upstashSet(key, value) {
  const res = await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
  const json = await res.json();
  if (json.result !== 'OK') throw new Error(`Upstash error for key "${key}": ${JSON.stringify(json)}`);
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'products.json');
  const raw      = fs.readFileSync(dataPath, 'utf-8');
  const { products, categories } = JSON.parse(raw);

  console.log(`📦  Migrating ${products.length} products and ${categories.length} categories to Redis...`);

  await upstashSet('products',   products);
  await upstashSet('categories', categories);

  console.log('✅  Migration complete! Redis now holds:');
  console.log(`    products   → ${products.length} items`);
  console.log(`    categories → ${categories.length} items`);
}

main().catch((err) => {
  console.error('❌  Migration failed:', err.message);
  process.exit(1);
});

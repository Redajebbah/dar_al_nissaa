const UPSTASH_URL   = 'https://mutual-worm-108776.upstash.io';
const UPSTASH_TOKEN = 'gQAAAAAAAajoAAIgcDI3MGE3YjJiZjNhYzg0NWJlYmJmZWZjMjNmNmEzZTY4NA';

async function main() {
  const res  = await fetch(`${UPSTASH_URL}/get/products`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const json = await res.json();
  const products = JSON.parse(json.result);
  console.log(`✅  Redis has ${products.length} products:`);
  products.forEach((p) => console.log(`   - [${p.id}] ${p.name.fr}`));
}
main().catch(console.error);

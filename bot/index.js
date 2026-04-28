require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const { Telegraf } = require('telegraf');
const Anthropic    = require('@anthropic-ai/sdk');
const fetch        = require('node-fetch');
const FormData     = require('form-data');
const path         = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID  = process.env.ADMIN_TELEGRAM_CHAT_ID;
const API_BASE       = process.env.SITE_URL || 'http://localhost:3000';
const ADMIN_SECRET   = process.env.ADMIN_SECRET;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;

if (!BOT_TOKEN || !ADMIN_CHAT_ID || !ADMIN_SECRET || !ANTHROPIC_KEY) {
  console.error('❌ Missing env vars. Check bot/.env');
  process.exit(1);
}

const bot       = new Telegraf(BOT_TOKEN);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ── State — last uploaded image waiting to be attached ───────────────────────
let pendingImage = null; // { path, filename }

// ── Auth middleware ───────────────────────────────────────────────────────────
bot.use((ctx, next) => {
  if (String(ctx.chat?.id) !== String(ADMIN_CHAT_ID)) {
    return ctx.reply('⛔ Accès non autorisé.');
  }
  return next();
});

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'x-admin-secret': ADMIN_SECRET },
  });
  return res.json();
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'x-admin-secret': ADMIN_SECRET, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiPut(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'x-admin-secret': ADMIN_SECRET, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { 'x-admin-secret': ADMIN_SECRET },
  });
  return res.json();
}

async function uploadImageToSite(buffer, filename) {
  const form = new FormData();
  form.append('file', buffer, { filename });
  form.append('filename', filename);
  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: 'POST',
    headers: { 'x-admin-secret': ADMIN_SECRET, ...form.getHeaders() },
    body: form,
  });
  return res.json();
}

// ── Claude AI ─────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant administrateur de "Dar Al Nissaa", une boutique de mode marocaine authentique.
Tu aides à gérer le catalogue de produits via des commandes en langage naturel (français ou darija).

Tu dois répondre UNIQUEMENT en JSON pur, sans markdown, sans explications.

Format de réponse:
{
  "action": "LIST" | "GET" | "CREATE" | "UPDATE" | "DELETE" | "ATTACH_IMAGE" | "UNKNOWN",
  "data": { ... },
  "reply": "Message court à afficher à l'admin"
}

Actions et leur "data":
- LIST: {}
- GET: { "query": "nom ou id du produit" }
- CREATE: { produit complet selon schéma }
- UPDATE: { "id": "...", ...champs à modifier }
- DELETE: { "id": "..." }
- ATTACH_IMAGE: { "query": "nom ou id du produit" }
- UNKNOWN: {}

Schéma produit complet:
{
  "id": "qj-001",                      // format: 2 lettres catégorie + tiret + 3 chiffres
  "name": { "fr": "...", "ar": "..." },
  "slug": "kebab-case-du-nom",
  "price": 450,                        // en MAD
  "originalPrice": 600,                // optionnel, si promotion
  "images": ["/products/fichier.jpg"],
  "category": "qmiss-jouhara" | "qmiss-ghourza" | "caftan" | "takchita" | "jelaba" | "qmayess-rbati",
  "subcategory": "sfifa-designs",      // optionnel
  "sizes": ["XS","S","M","L","XL","XXL"],
  "colors": [{"name":"...","nameAr":"...","hex":"#XXXXXX"}],
  "description": { "fr": "...", "ar": "..." },
  "material": "...",                   // optionnel
  "fabric": "Satin" | "Coton" | "Jacquard" | "Tissé" | "Brodé",
  "tags": ["handmade","luxury","new-collection","bestseller","promotion"],
  "inStock": true,
  "isNew": true,
  "isFeatured": true,
  "rating": 4.8,                       // optionnel
  "reviews": 25                        // optionnel
}

Exemples de ce que l'admin peut dire:
- "liste les produits" → LIST
- "montre moi le produit sfifa" → GET
- "ajoute un qmiss jouhara maalam noir à 500 MAD" → CREATE
- "change le prix du qmiss sfifa à 400 MAD" → UPDATE
- "supprime le produit qg-002" → DELETE
- "associe l'image à la takchita" → ATTACH_IMAGE
- "mets le qr-001 en promotion à 350 MAD, prix original 440 MAD" → UPDATE avec originalPrice`;

async function askClaude(userMessage, products) {
  const context = products
    ? `\nProduits actuels (${products.length}):\n` + products
        .map((p) => `[${p.id}] ${p.name.fr} — ${p.price} MAD (${p.category})`)
        .join('\n')
    : '';

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT + context,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = response.content[0].text.trim().replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(raw);
}

// ── Format helpers ────────────────────────────────────────────────────────────
function productSummary(p) {
  return (
    `*${p.name.fr}*\n` +
    `🆔 \`${p.id}\`  |  💰 ${p.price} MAD${p.originalPrice ? ` ~~${p.originalPrice}~~` : ''}\n` +
    `📂 ${p.category}${p.subcategory ? ` › ${p.subcategory}` : ''}\n` +
    `📏 Tailles: ${p.sizes.join(', ')}\n` +
    `🎨 Couleurs: ${p.colors.map((c) => c.name).join(', ')}\n` +
    `🏷️ Tags: ${(p.tags || []).join(', ') || '—'}\n` +
    `🖼️ ${p.images.join(', ')}`
  );
}

// ── /start command ────────────────────────────────────────────────────────────
bot.command('start', (ctx) => {
  ctx.replyWithMarkdown(
    `🌹 *Dar Al Nissaa — Bot Admin*\n\n` +
    `Bienvenue\\! Je comprends le langage naturel\\.\n\n` +
    `*Exemples de commandes:*\n` +
    `• "Liste les produits"\n` +
    `• "Montre moi le Qmiss Sfifa"\n` +
    `• "Ajoute un caftan rouge à 800 MAD"\n` +
    `• "Change le prix du qj\\-001 à 450 MAD"\n` +
    `• "Mets le ta\\-001 en promo à 850 MAD"\n` +
    `• "Supprime le produit qg\\-002"\n` +
    `• Envoyer une photo → upload automatique\n\n` +
    `💡 Parlez normalement, je comprends le français et le darija\\!`
  );
});

// ── Text messages → Claude ────────────────────────────────────────────────────
bot.on('text', async (ctx) => {
  const msg = ctx.message.text;
  if (msg.startsWith('/')) return;

  await ctx.sendChatAction('typing');

  try {
    const db       = await apiGet('/api/admin/products');
    const products = db.products || [];
    const action   = await askClaude(msg, products);

    switch (action.action) {

      case 'LIST': {
        if (products.length === 0) {
          return ctx.reply('📦 Aucun produit dans le catalogue.');
        }
        const list = products
          .map((p, i) => `${i + 1}\\. \\[${p.id}\\] *${escMd(p.name.fr)}* — ${p.price} MAD`)
          .join('\n');
        await ctx.replyWithMarkdownV2(
          `📦 *Catalogue — ${products.length} produits:*\n\n${list}`
        );
        break;
      }

      case 'GET': {
        const query = (action.data?.query || '').toLowerCase();
        const found = products.find(
          (p) =>
            p.id === query ||
            p.name.fr.toLowerCase().includes(query) ||
            p.slug.includes(query.replace(/\s+/g, '-'))
        );
        if (!found) return ctx.reply(`❌ Produit introuvable: "${action.data?.query}"`);
        await ctx.replyWithMarkdown(productSummary(found));
        break;
      }

      case 'CREATE': {
        const product = action.data;
        // Auto-generate slug if missing
        if (!product.slug && product.name?.fr) {
          product.slug = slugify(product.name.fr);
        }
        // Attach pending image if no images specified
        if ((!product.images || product.images.length === 0) && pendingImage) {
          product.images = [pendingImage.path];
          pendingImage = null;
        }
        const result = await apiPost('/api/admin/products', product);
        if (result.success) {
          await ctx.replyWithMarkdown(
            `✅ *Produit créé!*\n\n${productSummary(result.product)}`
          );
        } else {
          await ctx.reply(`❌ Erreur création: ${result.error}`);
        }
        break;
      }

      case 'UPDATE': {
        const { id: rawId, ...updates } = action.data || {};
        // If no id, find by name
        let targetId = rawId;
        if (!targetId && action.data?.query) {
          const q = action.data.query.toLowerCase();
          const found = products.find(
            (p) => p.name.fr.toLowerCase().includes(q) || p.id === q
          );
          targetId = found?.id;
        }
        if (!targetId) return ctx.reply('❌ Impossible de trouver le produit à modifier.');

        const result = await apiPut('/api/admin/products', { id: targetId, ...updates });
        if (result.success) {
          await ctx.replyWithMarkdown(
            `✅ *Produit mis à jour!*\n\n${action.reply}\n\n${productSummary(result.product)}`
          );
        } else {
          await ctx.reply(`❌ Erreur modification: ${result.error}`);
        }
        break;
      }

      case 'DELETE': {
        const delId = action.data?.id;
        if (!delId) return ctx.reply('❌ ID du produit manquant.');
        const toDelete = products.find((p) => p.id === delId);
        const result = await apiDelete(`/api/admin/products?id=${delId}`);
        if (result.success) {
          await ctx.reply(`🗑️ Produit supprimé: ${toDelete?.name?.fr || delId}`);
        } else {
          await ctx.reply(`❌ Erreur suppression: ${result.error}`);
        }
        break;
      }

      case 'ATTACH_IMAGE': {
        if (!pendingImage) {
          return ctx.reply('⚠️ Aucune image en attente. Envoyez d\'abord une photo.');
        }
        const query = (action.data?.query || '').toLowerCase();
        const found = products.find(
          (p) => p.id === query || p.name.fr.toLowerCase().includes(query)
        );
        if (!found) {
          return ctx.reply(
            `❌ Produit introuvable. Image sauvegardée: \`${pendingImage.path}\`\nDites "associe l'image à [nom exact]"`
          );
        }
        const images = [...(found.images || []), pendingImage.path];
        const result = await apiPut('/api/admin/products', { id: found.id, images });
        if (result.success) {
          await ctx.replyWithMarkdown(
            `✅ Image associée à *${found.name.fr}*!\n📁 \`${pendingImage.path}\``
          );
          pendingImage = null;
        } else {
          await ctx.reply(`❌ Erreur: ${result.error}`);
        }
        break;
      }

      default:
        await ctx.reply(
          action.reply ||
          '🤔 Je n\'ai pas compris. Essayez:\n• "liste les produits"\n• "ajoute un produit..."\n• "modifie le prix de..."'
        );
    }
  } catch (err) {
    console.error('Bot error:', err);
    await ctx.reply(`❌ Erreur: ${err.message}`);
  }
});

// ── Photo messages → upload + attach ─────────────────────────────────────────
bot.on('photo', async (ctx) => {
  await ctx.sendChatAction('upload_photo');

  try {
    // Highest-res photo
    const photos = ctx.message.photo;
    const photo  = photos[photos.length - 1];
    const file   = await ctx.telegram.getFile(photo.file_id);
    const ext    = path.extname(file.file_path || '.jpg') || '.jpg';
    const filename = `product-${Date.now()}${ext}`;
    const fileUrl  = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    // Download from Telegram
    const dlRes = await fetch(fileUrl);
    const buffer = Buffer.from(await dlRes.arrayBuffer());

    // Upload to site
    const result = await uploadImageToSite(buffer, filename);

    if (!result.success) {
      return ctx.reply(`❌ Erreur upload: ${result.error}`);
    }

    pendingImage = { path: result.path, filename };

    const caption = ctx.message.caption;

    // If admin wrote a caption, try to attach directly
    if (caption) {
      const db       = await apiGet('/api/admin/products');
      const products = db.products || [];
      const action   = await askClaude(`Associe l'image ${result.path} à ce produit: ${caption}`, products);

      if (action.action === 'ATTACH_IMAGE' && action.data?.query) {
        const query = action.data.query.toLowerCase();
        const found = products.find(
          (p) => p.id === query || p.name.fr.toLowerCase().includes(query)
        );
        if (found) {
          const images = [...(found.images || []), result.path];
          const upd = await apiPut('/api/admin/products', { id: found.id, images });
          if (upd.success) {
            pendingImage = null;
            return ctx.replyWithMarkdown(
              `✅ *Image uploadée et associée à ${found.name.fr}!*\n📁 \`${result.path}\``
            );
          }
        }
      }
    }

    await ctx.replyWithMarkdown(
      `📸 *Image uploadée avec succès!*\n\n` +
      `📁 Chemin: \`${result.path}\`\n\n` +
      `Pour l'associer à un produit, envoyez:\n` +
      `"Associe l'image à [nom du produit]"\n\n` +
      `Ou envoyez la prochaine photo directement avec le nom du produit en légende.`
    );
  } catch (err) {
    console.error('Photo error:', err);
    await ctx.reply(`❌ Erreur upload: ${err.message}`);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function escMd(str) {
  return str.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

// ── Launch ────────────────────────────────────────────────────────────────────
bot.launch();
console.log('🌹 Dar Al Nissaa Admin Bot démarré!');
console.log(`📡 Connecté à: ${API_BASE}`);
console.log(`🔐 Admin chat ID: ${ADMIN_CHAT_ID}`);

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

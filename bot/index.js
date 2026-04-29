require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const { Telegraf } = require('telegraf');
const Groq         = require('groq-sdk');
const fetch        = require('node-fetch');
const FormData     = require('form-data');
const path         = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const BOT_TOKEN     = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_CHAT_ID;
const API_BASE      = process.env.SITE_URL || 'http://localhost:3000';
const ADMIN_SECRET  = process.env.ADMIN_SECRET;
const GROQ_KEY      = process.env.GROQ_API_KEY;

if (!BOT_TOKEN || !ADMIN_CHAT_ID || !ADMIN_SECRET || !GROQ_KEY) {
  console.error('❌ Missing env vars. Check bot/.env');
  process.exit(1);
}

const bot  = new Telegraf(BOT_TOKEN);
const groq = new Groq({ apiKey: GROQ_KEY });

// ── State ─────────────────────────────────────────────────────────────────────
let pendingImage = null;   // { path, filename } — last uploaded photo
const sessions   = new Map(); // chatId → { step, data } — active wizard

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

// ── Groq AI (for LIST / GET / UPDATE / DELETE) ────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant administrateur de "Dar Al Nissaa", une boutique de mode marocaine authentique.
Tu aides à gérer le catalogue de produits via des commandes en langage naturel (français ou darija).

Tu dois répondre UNIQUEMENT en JSON pur, sans markdown, sans explications.

Format de réponse:
{
  "action": "LIST" | "GET" | "UPDATE" | "DELETE" | "ATTACH_IMAGE" | "UNKNOWN",
  "data": { ... },
  "reply": "Message court à afficher à l'admin"
}

Actions et leur "data":
- LIST: {}
- GET: { "query": "nom ou id du produit" }
- UPDATE: { "id": "...", ...champs à modifier }
- DELETE: { "id": "..." }
- ATTACH_IMAGE: { "query": "nom ou id du produit" }
- UNKNOWN: {}`;

async function askGroq(userMessage, products) {
  const context = products
    ? `\nProduits actuels (${products.length}):\n` +
      products.map((p) => `[${p.id}] ${p.name.fr} — ${p.price} MAD (${p.category})`).join('\n')
    : '';

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 512,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + context },
      { role: 'user',   content: userMessage },
    ],
  });

  const raw = response.choices[0].message.content
    .trim()
    .replace(/```json\n?|```\n?/g, '')
    .trim();
  return JSON.parse(raw);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function productSummary(p) {
  const sizes  = Array.isArray(p.sizes)  ? p.sizes.join(', ')               : '—';
  const colors = Array.isArray(p.colors) ? p.colors.map((c) => c.name).join(', ') : '—';
  const images = Array.isArray(p.images) ? p.images.join(', ')              : '—';
  return (
    `*${p.name.fr}*\n` +
    `ID: \`${p.id}\`  |  Prix: ${p.price} MAD${p.originalPrice ? ` (avant: ${p.originalPrice} MAD)` : ''}\n` +
    `Catégorie: ${p.category}${p.subcategory ? ` > ${p.subcategory}` : ''}\n` +
    `Tailles: ${sizes}\n` +
    `Couleurs: ${colors}\n` +
    `Tags: ${(p.tags || []).join(', ') || 'aucun'}\n` +
    `Images: ${images}`
  );
}

// Generate a unique ID for a new product based on its category
function generateId(category, existingProducts) {
  const prefixMap = {
    'qmiss-jouhara': 'qj',
    'qmiss-ghourza': 'qg',
    'takchita':      'ta',
    'qmayess-rbati': 'qr',
    'caftan':        'ca',
    'jelaba':        'je',
  };
  const prefix = prefixMap[category] || category.slice(0, 2).replace('-', '');
  const existing = existingProducts
    .filter((p) => p.id.startsWith(prefix + '-'))
    .map((p) => parseInt(p.id.split('-')[1], 10))
    .filter((n) => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

// Parse colors like "Rouge=#FF0000, Blanc=#FFFFFF" or "Rouge #FF0000"
function parseColors(input) {
  const parts = input.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  return parts.map((part) => {
    const hexMatch = part.match(/#[0-9A-Fa-f]{3,6}/);
    const hex      = hexMatch ? hexMatch[0].toUpperCase() : '#CCCCCC';
    const name     = part.replace(/#[0-9A-Fa-f]{3,6}/, '').replace(/[=:]/g, '').trim() || 'Couleur';
    return { name, nameAr: '', hex };
  });
}

// Normalize category input
function parseCategory(input) {
  const map = {
    'jouhara': 'qmiss-jouhara', 'qj': 'qmiss-jouhara', 'qmiss jouhara': 'qmiss-jouhara',
    'ghourza': 'qmiss-ghourza', 'qg': 'qmiss-ghourza', 'qmiss ghourza': 'qmiss-ghourza',
    'takchita': 'takchita', 'ta': 'takchita',
    'rbati': 'qmayess-rbati',  'qr': 'qmayess-rbati',  'qmayess rbati': 'qmayess-rbati',
    'caftan': 'caftan', 'ca': 'caftan',
    'jelaba': 'jelaba', 'je': 'jelaba',
  };
  const key = input.toLowerCase().trim();
  return map[key] || key;
}

// ── Interactive wizard — step definitions ─────────────────────────────────────
const STEPS = [
  {
    key: 'name_fr',
    ask: () => '📝 *Étape 1/12 — Nom du produit*\n\nQuel est le nom en français?',
  },
  {
    key: 'name_ar',
    ask: () => '🔤 *Étape 2/12 — Nom en arabe*\n\nNom en arabe? (ou tapez `ignorer`)',
  },
  {
    key: 'price',
    ask: () => '💰 *Étape 3/12 — Prix*\n\nPrix en MAD? (ex: `450`)',
  },
  {
    key: 'original_price',
    ask: () => '🏷️ *Étape 4/12 — Promotion*\n\nPrix original avant réduction?\n(ex: `600`) ou tapez `non` si pas de promo',
  },
  {
    key: 'category',
    ask: () =>
      '📂 *Étape 5/12 — Catégorie*\n\nChoisissez une catégorie:\n' +
      '• `qmiss-jouhara`\n• `qmiss-ghourza`\n• `takchita`\n• `qmayess-rbati`\n• `caftan`\n• `jelaba`',
  },
  {
    key: 'sizes',
    ask: () =>
      '📏 *Étape 6/12 — Tailles*\n\nTailles disponibles, séparées par virgule:\n(ex: `XS,S,M,L,XL,XXL`)',
  },
  {
    key: 'colors',
    ask: () =>
      '🎨 *Étape 7/12 — Couleurs*\n\nFormat: `Nom=#HEXCODE`, une par ligne ou séparées par virgule\n' +
      'Exemple:\n`Rouge=#FF0000, Blanc=#FFFFFF, Or=#FFD700`',
  },
  {
    key: 'description_fr',
    ask: () => '📄 *Étape 8/12 — Description*\n\nDescription du produit en français:',
  },
  {
    key: 'fabric',
    ask: () =>
      '🧵 *Étape 9/12 — Tissu*\n\n• `Satin`\n• `Coton`\n• `Jacquard`\n• `Tissé`\n• `Brodé`\n\n(ou tapez le tissu manuellement)',
  },
  {
    key: 'tags',
    ask: () =>
      '🏷️ *Étape 10/12 — Tags*\n\nTags séparés par virgule:\n' +
      '• `bestseller`\n• `handmade`\n• `new-collection`\n• `luxury`\n\n(ou tapez `aucun`)',
  },
  {
    key: 'is_featured',
    ask: () => '⭐ *Étape 11/12 — Produit vedette*\n\nMettre en avant sur la page d\'accueil?\n`oui` ou `non`',
  },
  {
    key: 'is_new',
    ask: () => '🆕 *Étape 12/12 — Nouveau produit*\n\nMarquer comme nouveau produit?\n`oui` ou `non`',
  },
  {
    key: 'photo',
    ask: () =>
      '📸 *Dernière étape — Photo*\n\nEnvoyez une photo du produit.\n(ou tapez `ignorer` pour finir sans photo)',
  },
];

function stepIndex(key) {
  return STEPS.findIndex((s) => s.key === key);
}

async function askStep(ctx, key) {
  const step = STEPS.find((s) => s.key === key);
  if (step) await ctx.replyWithMarkdown(step.ask());
}

async function startWizard(ctx) {
  const chatId = String(ctx.chat.id);
  sessions.set(chatId, { step: 'name_fr', data: {} });
  await ctx.replyWithMarkdown(
    `➕ *Ajouter un nouveau produit*\n\n` +
    `Je vais vous poser ${STEPS.length} questions.\n` +
    `Tapez /annuler à tout moment pour abandonner.\n\n`
  );
  await askStep(ctx, 'name_fr');
}

async function processWizardStep(ctx, input) {
  const chatId  = String(ctx.chat.id);
  const session = sessions.get(chatId);
  if (!session) return false; // not in wizard

  const { step, data } = session;

  switch (step) {
    case 'name_fr':
      data.name_fr = input.trim();
      session.step = 'name_ar';
      await askStep(ctx, 'name_ar');
      break;

    case 'name_ar':
      data.name_ar = input.toLowerCase() === 'ignorer' ? '' : input.trim();
      session.step = 'price';
      await askStep(ctx, 'price');
      break;

    case 'price': {
      const price = parseFloat(input.replace(/[^\d.]/g, ''));
      if (isNaN(price)) {
        await ctx.reply('⚠️ Prix invalide. Entrez un nombre, ex: `450`');
        return true;
      }
      data.price   = price;
      session.step = 'original_price';
      await askStep(ctx, 'original_price');
      break;
    }

    case 'original_price': {
      if (input.toLowerCase() !== 'non') {
        const orig = parseFloat(input.replace(/[^\d.]/g, ''));
        if (!isNaN(orig)) data.original_price = orig;
      }
      session.step = 'category';
      await askStep(ctx, 'category');
      break;
    }

    case 'category':
      data.category = parseCategory(input);
      session.step  = 'sizes';
      await askStep(ctx, 'sizes');
      break;

    case 'sizes':
      data.sizes   = input.split(/[,،\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
      session.step = 'colors';
      await askStep(ctx, 'colors');
      break;

    case 'colors':
      data.colors  = parseColors(input);
      session.step = 'description_fr';
      await askStep(ctx, 'description_fr');
      break;

    case 'description_fr':
      data.description_fr = input.trim();
      session.step        = 'fabric';
      await askStep(ctx, 'fabric');
      break;

    case 'fabric':
      data.fabric  = input.trim();
      session.step = 'tags';
      await askStep(ctx, 'tags');
      break;

    case 'tags':
      data.tags = input.toLowerCase() === 'aucun'
        ? []
        : input.split(/[,،]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
      session.step = 'is_featured';
      await askStep(ctx, 'is_featured');
      break;

    case 'is_featured':
      data.is_featured = input.toLowerCase().startsWith('o');
      session.step     = 'is_new';
      await askStep(ctx, 'is_new');
      break;

    case 'is_new':
      data.is_new  = input.toLowerCase().startsWith('o');
      session.step = 'photo';
      await askStep(ctx, 'photo');
      break;

    case 'photo':
      // "ignorer" typed as text → finish without photo
      if (input.toLowerCase() === 'ignorer') {
        await finishWizard(ctx, chatId, null);
      } else {
        await ctx.reply('📸 Envoyez une photo, ou tapez `ignorer` pour finir sans photo.');
      }
      break;

    default:
      sessions.delete(chatId);
      return false;
  }

  return true; // handled by wizard
}

async function finishWizard(ctx, chatId, imagePath) {
  const session = sessions.get(chatId);
  if (!session) return;
  const { data } = session;
  sessions.delete(chatId);

  await ctx.reply('⏳ Création du produit en cours...');

  try {
    // Fetch existing products to generate ID
    const db       = await apiGet('/api/admin/products');
    const existing = db.products || [];

    const id = generateId(data.category, existing);

    const product = {
      id,
      slug:          slugify(data.name_fr),
      name:          { fr: data.name_fr, ar: data.name_ar || '' },
      price:         data.price,
      ...(data.original_price && { originalPrice: data.original_price }),
      images:        imagePath ? [imagePath] : [],
      category:      data.category,
      sizes:         data.sizes,
      colors:        data.colors,
      description:   { fr: data.description_fr, ar: '' },
      fabric:        data.fabric,
      tags:          data.tags,
      inStock:       true,
      isFeatured:    data.is_featured,
      isNew:         data.is_new,
    };

    const result = await apiPost('/api/admin/products', product);

    if (result.success) {
      await ctx.replyWithMarkdown(
        `✅ *Produit créé avec succès!*\n\n${productSummary(result.product)}\n\n` +
        `🌐 Visible sur le site maintenant!`
      );
    } else {
      await ctx.reply(`❌ Erreur création: ${result.error}\n\nTapez "ajouter" pour réessayer.`);
    }
  } catch (err) {
    console.error('Wizard finish error:', err);
    await ctx.reply(`❌ Erreur: ${err.message}`);
  }
}

// ── /start command ────────────────────────────────────────────────────────────
bot.command('start', (ctx) => {
  ctx.replyWithMarkdown(
    `🌹 *Dar Al Nissaa — Bot Admin*\n\n` +
    `*Commandes disponibles:*\n\n` +
    `➕ \`ajouter\` — assistant pas à pas pour créer un produit\n` +
    `📦 \`liste les produits\` — voir tout le catalogue\n` +
    `🔍 \`montre [nom]\` — détails d'un produit\n` +
    `✏️ \`change le prix de [id] à [X] MAD\` — modifier\n` +
    `🗑️ \`supprime [id]\` — supprimer un produit\n` +
    `📸 Envoyer une photo — upload automatique\n\n` +
    `💡 Je comprends le français et le darija!`
  );
});

// ── /annuler — cancel wizard ──────────────────────────────────────────────────
bot.command('annuler', (ctx) => {
  const chatId = String(ctx.chat.id);
  if (sessions.has(chatId)) {
    sessions.delete(chatId);
    ctx.reply('❌ Ajout annulé. Tapez "ajouter" pour recommencer.');
  } else {
    ctx.reply('Aucune opération en cours.');
  }
});

// ── Text messages ─────────────────────────────────────────────────────────────
bot.on('text', async (ctx) => {
  const msg    = ctx.message.text.trim();
  const chatId = String(ctx.chat.id);

  if (msg.startsWith('/')) return;

  console.log(`📩 "${msg}" de ${chatId}`);

  // ── Wizard in progress — feed the answer ────────────────────────────────
  if (sessions.has(chatId)) {
    await processWizardStep(ctx, msg);
    return;
  }

  // ── Trigger wizard ───────────────────────────────────────────────────────
  const lower = msg.toLowerCase();
  if (
    lower === 'ajouter' ||
    lower.startsWith('ajouter ') ||
    lower === 'ajoute' ||
    lower.startsWith('ajoute un') ||
    lower === 'nouveau produit' ||
    lower === 'add'
  ) {
    await startWizard(ctx);
    return;
  }

  // ── All other commands → Groq AI ─────────────────────────────────────────
  await ctx.sendChatAction('typing');

  try {
    const db       = await apiGet('/api/admin/products');
    const products = db.products || [];
    const action   = await askGroq(msg, products);

    switch (action.action) {

      case 'LIST': {
        if (products.length === 0) {
          return ctx.reply('📦 Aucun produit dans le catalogue.');
        }
        const list = products
          .map((p, i) => `${i + 1}. \`${p.id}\` — *${p.name.fr}* — ${p.price} MAD`)
          .join('\n');
        await ctx.replyWithMarkdown(`📦 *Catalogue — ${products.length} produits:*\n\n${list}`);
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

      case 'UPDATE': {
        const { id: rawId, ...updates } = action.data || {};
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
            `✅ *Produit mis à jour!*\n\n${productSummary(result.product)}`
          );
        } else {
          await ctx.reply(`❌ Erreur modification: ${result.error}`);
        }
        break;
      }

      case 'DELETE': {
        const delId   = action.data?.id;
        if (!delId) return ctx.reply('❌ ID du produit manquant.');
        const toDelete = products.find((p) => p.id === delId);
        const result   = await apiDelete(`/api/admin/products?id=${delId}`);
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
            `❌ Produit introuvable. Image sauvegardée: ${pendingImage.path}\nDites "associe l'image à [nom exact]"`
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
          '🤔 Je n\'ai pas compris.\n\n• Tapez "ajouter" pour créer un produit\n• "liste les produits"\n• "supprime [id]"\n• "change le prix de [id] à X MAD"'
        );
    }
  } catch (err) {
    console.error('Bot error:', err);
    await ctx.reply(`❌ Erreur: ${err.message}`);
  }
});

// ── Shared photo/document upload handler ─────────────────────────────────────
async function handleUpload(ctx, fileId, defaultExt) {
  await ctx.sendChatAction('upload_photo');

  try {
    const file     = await ctx.telegram.getFile(fileId);
    const ext      = path.extname(file.file_path || defaultExt) || defaultExt;
    const filename = `product-${Date.now()}${ext}`;
    const fileUrl  = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const dlRes  = await fetch(fileUrl);
    const buffer = Buffer.from(await dlRes.arrayBuffer());
    const result = await uploadImageToSite(buffer, filename);

    if (!result.success) {
      return ctx.reply(`❌ Erreur upload: ${result.error}`);
    }

    const chatId  = String(ctx.chat.id);
    const session = sessions.get(chatId);

    // ── Wizard photo step ────────────────────────────────────────────────────
    if (session && session.step === 'photo') {
      await ctx.replyWithMarkdown(`📸 Photo uploadée: \`${result.path}\``);
      await finishWizard(ctx, chatId, result.path);
      return;
    }

    // ── Standalone photo — save as pending ──────────────────────────────────
    pendingImage = { path: result.path, filename };
    const caption = ctx.message.caption;

    if (caption) {
      const db       = await apiGet('/api/admin/products');
      const products = db.products || [];
      const action   = await askGroq(
        `Associe l'image ${result.path} à ce produit: ${caption}`, products
      );
      if (action.action === 'ATTACH_IMAGE' && action.data?.query) {
        const q     = action.data.query.toLowerCase();
        const found = products.find(
          (p) => p.id === q || p.name.fr.toLowerCase().includes(q)
        );
        if (found) {
          const images = [...(found.images || []), result.path];
          const upd    = await apiPut('/api/admin/products', { id: found.id, images });
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
      `📸 *Image uploadée!*\n\n` +
      `🔗 \`${result.path}\`\n\n` +
      `Envoyez "associe l'image à [nom du produit]" pour l'attacher,\n` +
      `ou tapez "ajouter" pour créer un nouveau produit avec cette photo.`
    );
  } catch (err) {
    console.error('Upload error:', err);
    await ctx.reply(`❌ Erreur upload: ${err.message}`);
  }
}

// ── Photo messages (compressed) ───────────────────────────────────────────────
bot.on('photo', async (ctx) => {
  const photos = ctx.message.photo;
  const photo  = photos[photos.length - 1]; // highest resolution
  await handleUpload(ctx, photo.file_id, '.jpg');
});

// ── Document messages (original quality / file) ───────────────────────────────
bot.on('document', async (ctx) => {
  const doc      = ctx.message.document;
  const mimeType = doc.mime_type || '';
  if (!mimeType.startsWith('image/')) {
    return ctx.reply('⚠️ Ce fichier n\'est pas une image. Envoyez une photo JPG, PNG ou WEBP.');
  }
  await handleUpload(ctx, doc.file_id, '.jpg');
});

// ── Launch ────────────────────────────────────────────────────────────────────
bot.launch();
console.log('🌹 Dar Al Nissaa Admin Bot démarré!');
console.log(`📡 Connecté à: ${API_BASE}`);
console.log(`🔐 Admin chat ID: ${ADMIN_CHAT_ID}`);

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

import { NextRequest, NextResponse } from 'next/server';

const TG_API = 'https://api.telegram.org';

export async function POST(req: NextRequest) {
  try {
    const { orderId, form, items, total } = await req.json();

    const botToken   = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

    if (!botToken || !adminChatId) {
      // Silently skip if not configured — don't break the customer flow
      return NextResponse.json({ ok: true });
    }

    // ── Build the message ─────────────────────────────────────────────────────
    const itemLines = (items as Array<{
      product: { name: { fr: string }; price: number };
      selectedSize: string;
      selectedColor: { name: string };
      quantity: number;
    }>)
      .map(
        (i) =>
          `• ${i.product.name.fr}\n  ${i.selectedSize} · ${i.selectedColor.name} · ×${i.quantity} = ${i.product.price * i.quantity} MAD`
      )
      .join('\n');

    const text =
      `🛍️ *NOUVELLE COMMANDE — Dar Al Nissaa*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔖 *N° Commande:* \`${orderId}\`\n\n` +
      `👤 *CLIENT*\n` +
      `Nom: ${form.firstName} ${form.lastName}\n` +
      `📞 Tél: ${form.phone}\n\n` +
      `📦 *LIVRAISON*\n` +
      `Ville: ${form.city}\n` +
      `Adresse: ${form.address}` +
      (form.notes ? `\nNotes: ${form.notes}` : '') +
      `\n\n` +
      `🛒 *ARTICLES*\n` +
      `${itemLines}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL: ${total} MAD*\n` +
      `💳 Paiement: Cash à la livraison\n\n` +
      `📱 Appeler le client: [${form.phone}](tel:${form.phone})`;

    const res = await fetch(
      `${TG_API}/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    adminChatId,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram notify error:', data);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('notify-order error:', err);
    // Never fail the customer request
    return NextResponse.json({ ok: true });
  }
}

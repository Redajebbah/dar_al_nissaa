import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CartItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-MA')} MAD`;
}

export function formatDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}

const STORE_WHATSAPP = '212644158443';
const STORE_NAME = 'Dar Al Nissaa';

export function buildWhatsAppMessage(items: CartItem[], form?: {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}): string {
  const line = '━━━━━━━━━━━━━━━━━━━━━━';

  let message = `🌹 *Nouvelle Commande — ${STORE_NAME}*\n`;
  message += `${line}\n\n`;

  message += `🛍️ *Articles commandés:*\n`;
  items.forEach((item, i) => {
    message += `\n${i + 1}. *${item.product.name.fr}*\n`;
    message += `   • Taille: ${item.selectedSize}\n`;
    message += `   • Couleur: ${item.selectedColor.name}\n`;
    message += `   • Quantité: ×${item.quantity}\n`;
    message += `   • Prix: ${formatPrice(item.product.price * item.quantity)}\n`;
  });

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  message += `\n${line}\n`;
  message += `💰 *Total: ${formatPrice(total)}*\n`;
  message += `🚚 Livraison: Gratuite 🇲🇦\n`;
  message += `💳 Paiement: Cash à la livraison\n`;

  if (form) {
    message += `\n${line}\n`;
    message += `👤 *Informations client:*\n`;
    message += `• Nom: ${form.firstName} ${form.lastName}\n`;
    message += `• Téléphone: ${form.phone}\n`;
    message += `• Ville: ${form.city}\n`;
    message += `• Adresse: ${form.address}\n`;
    if (form.notes) {
      message += `• Notes: ${form.notes}\n`;
    }
  }

  message += `\n${line}\n`;
  message += `شكراً على ثقتكم — Merci pour votre confiance 🌹`;

  return encodeURIComponent(message);
}

export function openWhatsApp(message: string, phone = STORE_WHATSAPP) {
  const url = `https://wa.me/${phone}?text=${message}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

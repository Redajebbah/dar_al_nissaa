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

export function buildWhatsAppMessage(items: CartItem[], form?: {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
}): string {
  const storeName = 'Boutique Marocaine';
  const storePhone = '212600000000';

  let message = `Bonjour ${storeName} 👋\n\n`;
  message += `J'aimerais passer une commande:\n\n`;
  message += `🛍️ *Produits:*\n`;

  items.forEach((item) => {
    message += `• ${item.product.name.fr} x${item.quantity}\n`;
    message += `  Taille: ${item.selectedSize} | Couleur: ${item.selectedColor.name}\n`;
    message += `  Prix: ${formatPrice(item.product.price * item.quantity)}\n\n`;
  });

  const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  message += `💰 *Total: ${formatPrice(total)}*\n`;
  message += `🚚 Livraison: Gratuite\n`;
  message += `💳 Paiement: Cash à la livraison\n\n`;

  if (form) {
    message += `👤 *Informations client:*\n`;
    message += `Nom: ${form.firstName} ${form.lastName}\n`;
    message += `Téléphone: ${form.phone}\n`;
    message += `Ville: ${form.city}\n`;
    message += `Adresse: ${form.address}\n`;
    if (form.notes) message += `Notes: ${form.notes}\n`;
  }

  message += `\nMerci! 🌹`;

  return encodeURIComponent(message);
}

export function openWhatsApp(message: string, phone = '212600000000') {
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

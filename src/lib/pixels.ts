/**
 * Analytics pixel events
 * Replace META_PIXEL_ID and TIKTOK_PIXEL_ID with real values in production
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void };
  }
}

const META_PIXEL_ID = 'YOUR_META_PIXEL_ID';
const TIKTOK_PIXEL_ID = 'YOUR_TIKTOK_PIXEL_ID';

// ─── Meta (Facebook) Pixel ──────────────────────────────────────────────────

function metaTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params);
  }
}

// ─── TikTok Pixel ───────────────────────────────────────────────────────────

function tikTokTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(event, params);
  }
}

// ─── Events ─────────────────────────────────────────────────────────────────

export function trackPageView() {
  metaTrack('PageView');
  tikTokTrack('PageView');
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category: string;
}) {
  metaTrack('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    value: product.price,
    currency: 'MAD',
  });
  tikTokTrack('ViewContent', {
    content_id: product.id,
    content_name: product.name,
    price: product.price,
    currency: 'MAD',
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  metaTrack('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    value: product.price * product.quantity,
    currency: 'MAD',
    num_items: product.quantity,
  });
  tikTokTrack('AddToCart', {
    content_id: product.id,
    content_name: product.name,
    quantity: product.quantity,
    price: product.price,
    currency: 'MAD',
  });
}

export function trackInitiateCheckout(params: {
  value: number;
  numItems: number;
}) {
  metaTrack('InitiateCheckout', {
    value: params.value,
    currency: 'MAD',
    num_items: params.numItems,
  });
  tikTokTrack('InitiateCheckout', {
    value: params.value,
    currency: 'MAD',
    quantity: params.numItems,
  });
}

export function trackPurchase(params: {
  orderId: string;
  value: number;
  numItems: number;
}) {
  metaTrack('Purchase', {
    value: params.value,
    currency: 'MAD',
    num_items: params.numItems,
    order_id: params.orderId,
  });
  tikTokTrack('CompletePayment', {
    content_id: params.orderId,
    value: params.value,
    currency: 'MAD',
    quantity: params.numItems,
  });
}

// ─── Pixel Initializer (call in layout) ─────────────────────────────────────

export function initPixels() {
  if (typeof window === 'undefined') return;

  // Meta Pixel snippet
  if (!window.fbq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${META_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }
}

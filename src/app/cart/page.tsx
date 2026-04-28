'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

// Cart page simply opens the drawer and redirects home
export default function CartPage() {
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    openCart();
  }, [openCart]);

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-cream">
      <p className="text-emerald font-serif text-xl">
        Chargement du panier...
      </p>
    </div>
  );
}

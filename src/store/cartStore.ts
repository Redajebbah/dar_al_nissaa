'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Color, CartItem, CartStore } from '@/types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, size: string, color: Color, qty = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product.id === product.id &&
              i.selectedSize === size &&
              i.selectedColor.name === color.name
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id &&
                i.selectedSize === size &&
                i.selectedColor.name === color.name
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { product, quantity: qty, selectedSize: size, selectedColor: color },
            ],
          };
        });
      },

      removeItem: (productId: string, size: string, colorName: string) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.product.id === productId &&
                i.selectedSize === size &&
                i.selectedColor.name === colorName
              )
          ),
        }));
      },

      updateQuantity: (productId: string, size: string, colorName: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId, size, colorName);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId &&
            i.selectedSize === size &&
            i.selectedColor.name === colorName
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'moroccan-boutique-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

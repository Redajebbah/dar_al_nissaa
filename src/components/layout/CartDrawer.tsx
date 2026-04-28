'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, buildWhatsAppMessage, openWhatsApp } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore();

  const total = getTotal();

  const handleWhatsAppOrder = () => {
    const message = buildWhatsAppMessage(items);
    openWhatsApp(message);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-emerald" />
                <h2 className="font-serif text-xl text-emerald">
                  Mon Panier
                </h2>
                {getItemCount() > 0 && (
                  <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-cream-200 transition-colors"
              >
                <X size={20} className="text-emerald" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={56} className="text-emerald/20" />
                  <p className="text-emerald/60 font-serif text-xl">
                    Votre panier est vide
                  </p>
                  <p className="text-sm text-gray-400">
                    Découvrez nos collections et ajoutez vos articles préférés
                  </p>
                  <Link
                    href="/collections/kaftan"
                    onClick={closeCart}
                    className="mt-4 bg-emerald text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    Voir les collections
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 bg-white rounded-2xl p-3 shadow-card"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name.fr}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-emerald text-sm leading-tight mb-1 line-clamp-2">
                            {item.product.name.fr}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">
                              {item.selectedSize}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <span
                                className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                                style={{ background: item.selectedColor.hex }}
                              />
                              {item.selectedColor.name}
                            </span>
                          </div>
                          <p className="font-semibold text-emerald text-sm">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>

                          {/* Quantity + Delete */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 bg-cream rounded-full px-2 py-1">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor.name,
                                    item.quantity - 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-semibold w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor.name,
                                    item.quantity + 1
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                removeItem(
                                  item.product.id,
                                  item.selectedSize,
                                  item.selectedColor.name
                                )
                              }
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cream-200 px-6 py-5 bg-white">
                {/* Delivery */}
                <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                  <span>Livraison</span>
                  <span className="text-emerald font-medium">Gratuite 🇲🇦</span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-serif text-lg text-emerald">Total</span>
                  <span className="font-bold text-2xl text-emerald">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full bg-emerald text-white text-center py-4 rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-luxury"
                  >
                    Commander — {formatPrice(total)}
                  </Link>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-[#25D366] text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Commander via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

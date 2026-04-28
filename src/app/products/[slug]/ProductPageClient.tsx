'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShoppingBag, ChevronDown, ChevronRight,
  Star, Shield, Truck, RotateCcw, Scissors, Gem,
} from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import SizeSelector from '@/components/product/SizeSelector';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatDiscount } from '@/lib/utils';
import type { Product, CategoryInfo, Color } from '@/types';

const STORE_WHATSAPP = '212644158443';

const accordionItems = [
  { title: 'Description',          key: 'desc'     },
  { title: 'Guide des Tailles',    key: 'sizes',
    content: `XS: 34-36 • S: 38-40 • M: 42-44 • L: 46-48 • XL: 50-52 • XXL: 54-56\n\nNos vêtements taillent normalement. En cas de doute, prenez la taille au-dessus.` },
  { title: 'Livraison & Retours',  key: 'delivery',
    content: `🚚 Livraison gratuite partout au Maroc sous 24-48h\n💳 Paiement cash à la livraison\n🔄 Échange gratuit sous 7 jours\n📞 Support WhatsApp 7j/7` },
  { title: 'Entretien',            key: 'care',
    content: `• Lavage délicat à la main ou machine à 30°C\n• Repasser à basse température\n• Ne pas mettre au sèche-linge\n• Conserver à l'abri de la lumière directe` },
];

interface Props {
  product:      Product;
  related:      Product[];
  categoryInfo: CategoryInfo | undefined;
}

export default function ProductPageClient({ product, related, categoryInfo }: Props) {
  const [selectedSize,   setSelectedSize]   = useState(product.sizes[0]);
  const [selectedColor,  setSelectedColor]  = useState<Color>(product.colors[0]);
  const [quantity,       setQuantity]       = useState(1);
  const [openAccordion,  setOpenAccordion]  = useState<string>('desc');
  const [addedAnim,      setAddedAnim]      = useState(false);

  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor, quantity);
    setAddedAnim(true);
    setTimeout(() => { setAddedAnim(false); openCart(); }, 600);
  };

  const discount = product.originalPrice
    ? formatDiscount(product.originalPrice, product.price)
    : null;

  const waText = encodeURIComponent(
    `Bonjour Dar Al Nissaa!\nJe souhaite commander:\n*${product.name.fr}*\nTaille: ${selectedSize} | Couleur: ${selectedColor.name}\nPrix: ${formatPrice(product.price)}\nQuantité: ×${quantity}`
  );

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-emerald transition-colors">Accueil</Link>
          <ChevronRight size={14} />
          <Link href={`/collections/${product.category}`} className="hover:text-emerald transition-colors">
            {categoryInfo?.nameFr || product.category}
          </Link>
          <ChevronRight size={14} />
          <span className="text-emerald font-medium line-clamp-1">{product.name.fr}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ProductGallery images={product.images} productName={product.name.fr} />
          </motion.div>

          {/* Product info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
            {/* Category & badges */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Link href={`/collections/${product.category}`} className="text-gold text-xs font-semibold tracking-wider uppercase hover:underline">
                {categoryInfo?.nameFr || product.category}
              </Link>
              {product.isNew && (
                <span className="bg-emerald text-white text-xs font-semibold px-2.5 py-1 rounded-full">Nouveau</span>
              )}
              {discount && discount >= 10 && (
                <span className="bg-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full">-{discount}%</span>
              )}
              {product.tags?.includes('handmade') && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Scissors size={11} strokeWidth={2.5} /> Fait Main
                </span>
              )}
              {product.tags?.includes('luxury') && (
                <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Gem size={11} strokeWidth={2.5} /> Luxe
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-emerald font-bold leading-tight mb-2">
              {product.name.fr}
            </h1>
            <p className="font-arabic text-xl text-gold mb-4" dir="rtl">{product.name.ar}</p>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating!) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating} ({product.reviews} avis)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-emerald">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {discount && discount >= 10 && (
                <span className="text-sm font-semibold text-red-500">
                  Économisez {formatPrice(product.originalPrice! - product.price)}
                </span>
              )}
            </div>

            <div className="h-px bg-cream-300 mb-6" />

            {/* Color selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-emerald uppercase tracking-wider">Couleur</label>
                <span className="text-sm text-gray-500">{selectedColor.name}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button key={color.name} onClick={() => setSelectedColor(color)} title={color.name}
                    className={`w-10 h-10 rounded-full transition-all duration-200 border-2 ${selectedColor.name === color.name ? 'border-emerald scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                    style={{ background: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-emerald uppercase tracking-wider">Taille</label>
                <button className="text-xs text-gold hover:underline">Guide des tailles</button>
              </div>
              <SizeSelector sizes={product.sizes} selected={selectedSize} onChange={setSelectedSize} />
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="text-sm font-semibold text-emerald uppercase tracking-wider mb-3 block">Quantité</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-cream-300 rounded-full overflow-hidden">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-emerald hover:bg-cream-200 transition-colors font-bold text-lg">−</button>
                  <span className="w-12 text-center font-semibold text-emerald">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-emerald hover:bg-cream-200 transition-colors font-bold text-lg">+</button>
                </div>
                <span className="text-sm text-gray-400">Total: {formatPrice(product.price * quantity)}</span>
              </div>
            </div>

            {/* Add to cart + WhatsApp */}
            <div className="flex gap-3 mb-8">
              <motion.button onClick={handleAddToCart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                animate={addedAnim ? { scale: [1, 1.05, 1] } : {}}
                className="flex-1 bg-emerald text-white py-4 px-6 rounded-full font-semibold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-colors shadow-luxury text-base">
                <AnimatePresence mode="wait">
                  {addedAnim ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                      ✓ Ajouté au panier!
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                      <ShoppingBag size={20} /> Ajouter au Panier
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <a href={`https://wa.me/${STORE_WHATSAPP}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors shadow-md"
                aria-label="Commander via WhatsApp">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Truck size={18} />,    text: 'Livraison gratuite' },
                { icon: <Shield size={18} />,   text: 'Qualité garantie'  },
                { icon: <RotateCcw size={18} />,text: 'Échange 7 jours'   },
              ].map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-2 bg-white rounded-xl p-3 text-center shadow-card">
                  <span className="text-emerald">{badge.icon}</span>
                  <span className="text-xs text-gray-500 leading-tight">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="flex flex-col divide-y divide-cream-300">
              {accordionItems.map((item) => (
                <div key={item.key}>
                  <button onClick={() => setOpenAccordion(openAccordion === item.key ? '' : item.key)}
                    className="w-full flex items-center justify-between py-4 text-left">
                    <span className="font-semibold text-emerald">{item.title}</span>
                    <ChevronDown size={18} className={`text-gold transition-transform duration-200 ${openAccordion === item.key ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === item.key && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="pb-5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {item.key === 'desc' ? product.description.fr : item.content}
                          {item.key === 'desc' && product.material && (
                            <p className="mt-3 text-emerald font-medium">Matière: {product.material}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-10">
              <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-2">Vous aimerez aussi</p>
              <h2 className="font-serif text-3xl text-emerald">Produits Similaires</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

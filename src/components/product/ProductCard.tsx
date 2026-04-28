'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Scissors, Gem, Zap, TrendingUp, Tag } from 'lucide-react';
import type { Product, ProductTag } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { formatPrice, formatDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import Badge from '@/components/ui/Badge';

const categoryLabels: Record<string, string> = {
  'qmiss-jouhara': 'Qmiss Jouhara',
  'qmiss-ghourza': 'Qmiss Ghourza',
  'caftan': 'Caftan',
  'takchita': 'Takchita',
  'jelaba': 'Jelaba',
  'qmayess-rbati': 'Qmayess Rbati',
};

const tagConfig: Record<ProductTag, { label: string; icon: LucideIcon; className: string }> = {
  handmade:         { label: 'Fait Main',    icon: Scissors,   className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  luxury:           { label: 'Luxe',         icon: Gem,        className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  'new-collection': { label: 'Nouveau',      icon: Zap,        className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  bestseller:       { label: 'Best-seller',  icon: TrendingUp, className: 'bg-orange-50 text-orange-700 border border-orange-200' },
  promotion:        { label: 'Promo',        icon: Tag,        className: 'bg-red-50 text-red-700 border border-red-200' },
};

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0], product.colors[0]);
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discount = product.originalPrice
    ? formatDiscount(product.originalPrice, product.price)
    : null;

  // Show at most 2 tags (prioritize handmade/luxury)
  const displayTags = (product.tags ?? []).slice(0, 2);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-200 mb-4 shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
          {/* Product image */}
          <Image
            src={product.images[imageIdx] || product.images[0]}
            alt={product.name.fr}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageIdx(0)}
          />

          {/* Second image on hover */}
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={`${product.name.fr} - vue 2`}
              fill
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && <Badge variant="new">Nouveau</Badge>}
            {discount && discount >= 10 && (
              <Badge variant="sale">-{discount}%</Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              size={16}
              className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>

          {/* Quick actions overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-emerald text-white text-xs font-semibold py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 hover:bg-emerald-600 transition-colors shadow-luxury"
            >
              <ShoppingBag size={14} />
              Ajouter
            </button>
            <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-cream-200 transition-colors shadow-sm cursor-pointer">
              <Eye size={15} className="text-emerald" />
            </span>
          </div>

          {/* Color swatches on hover */}
          {product.colors.length > 1 && (
            <div className="absolute bottom-14 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.name}
                  title={color.name}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-125 transition-transform"
                  style={{ background: color.hex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="px-1">
          {/* Category label */}
          <p className="text-xs text-gold font-medium tracking-wide uppercase mb-1">
            {categoryLabels[product.category] || product.category}
          </p>

          {/* Product name */}
          <h3 className="font-serif text-emerald font-semibold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-gold-500 transition-colors">
            {product.name.fr}
          </h3>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {displayTags.map((tag) => {
                const cfg = tagConfig[tag];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}
                  >
                    <Icon size={9} strokeWidth={2.5} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald text-lg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating!) ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.reviews})</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

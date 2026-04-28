'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts, getNewProducts, getBestSellers, getPromotions } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { GeometricBorder } from '@/components/MoroccanPattern';

type Tab = 'featured' | 'new' | 'bestsellers' | 'promotions';

const tabs: { id: Tab; label: string; emoji: string }[] = [
  { id: 'featured', label: 'Sélection', emoji: '✨' },
  { id: 'new', label: 'Nouveautés', emoji: '🆕' },
  { id: 'bestsellers', label: 'Best-sellers', emoji: '⭐' },
  { id: 'promotions', label: 'Promotions', emoji: '🏷️' },
];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<Tab>('featured');

  const products = {
    featured: getFeaturedProducts(),
    new: getNewProducts(),
    bestsellers: getBestSellers(),
    promotions: getPromotions(),
  };

  const displayed = products[activeTab].slice(0, 8);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal className="text-center mb-12">
          <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-3">
            Nos Créations
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-emerald mb-2">
            Collection Exclusive
          </h2>
          <GeometricBorder className="mt-5 max-w-xs mx-auto" />
        </ScrollReveal>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-1 bg-cream rounded-2xl p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-emerald/60 hover:text-emerald'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-emerald rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
                {tab.id !== 'featured' && products[tab.id].length > 0 && (
                  <span
                    className={`relative ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald/10 text-emerald'
                    }`}
                  >
                    {products[tab.id].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {displayed.length === 0 ? (
              <div className="text-center py-16 text-emerald/30 font-serif text-xl">
                Aucun produit dans cette sélection
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {displayed.map((product, i) => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} priority={i < 4} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </motion.div>
        </AnimatePresence>

        {/* View all */}
        <div className="mt-12 text-center">
          <Link
            href="/collections/caftan"
            className="group inline-flex items-center gap-2 text-emerald font-semibold hover:text-gold transition-colors text-sm border border-emerald/30 rounded-full px-6 py-3 hover:border-gold"
          >
            Voir toutes nos collections
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, TrendingUp, Tag } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { StaggerContainer, StaggerItem } from '@/components/animations/ScrollReveal';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { GeometricBorder } from '@/components/MoroccanPattern';
import type { LucideIcon } from 'lucide-react';
import type { Product } from '@/types';

type Tab = 'featured' | 'new' | 'bestsellers' | 'promotions';

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'featured',    label: 'Sélection',    icon: Sparkles   },
  { id: 'new',         label: 'Nouveautés',   icon: Zap        },
  { id: 'bestsellers', label: 'Best-sellers', icon: TrendingUp },
  { id: 'promotions',  label: 'Promotions',   icon: Tag        },
];

interface FeaturedProductsProps {
  featured:    Product[];
  newProducts: Product[];
  bestsellers: Product[];
  promotions:  Product[];
}

export default function FeaturedProducts({
  featured,
  newProducts,
  bestsellers,
  promotions,
}: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('featured');

  const products = {
    featured,
    new:         newProducts,
    bestsellers,
    promotions,
  };

  const displayed = products[activeTab].slice(0, 8);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <ScrollReveal className="text-center mb-14">
          <p className="text-gold text-xs font-semibold tracking-[0.4em] uppercase mb-4">
            Nos Créations
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-emerald mb-5">
            Collection Exclusive
          </h2>
          <GeometricBorder className="max-w-xs mx-auto" />
        </ScrollReveal>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center border border-emerald/15 rounded-2xl p-1 bg-white shadow-sm gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = products[tab.id].length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-emerald/50 hover:text-emerald'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-emerald rounded-xl shadow-sm"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                    />
                  )}
                  <Icon
                    size={14}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="relative z-10 shrink-0"
                  />
                  <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                  {tab.id !== 'featured' && count > 0 && (
                    <span
                      className={`relative z-10 text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none px-1 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-emerald/8 text-emerald/60'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className="h-px w-16 bg-emerald/10" />
            <span className="text-xs text-emerald/30 tracking-widest uppercase font-medium">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
            <div className="h-px w-16 bg-emerald/10" />
          </div>
        </div>

        {/* Products grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {displayed.length === 0 ? (
              <div className="text-center py-16 text-emerald/25 font-serif text-xl tracking-wide">
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

        {/* View all CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/collections/qmiss-jouhara"
            className="group inline-flex items-center gap-2.5 text-emerald font-semibold text-sm border border-emerald/25 rounded-full px-7 py-3.5 hover:border-gold hover:text-gold transition-all duration-300"
          >
            Voir toutes nos collections
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notFound, useParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { getProductsByCategory, categories, allFabrics } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import ScrollReveal from '@/components/animations/ScrollReveal';
import MoroccanPattern from '@/components/MoroccanPattern';
import { GeometricBorder } from '@/components/MoroccanPattern';
import type { Product, ProductTag } from '@/types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'En vedette' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Nouveautés' },
];

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Sur Mesure'];

const tagLabels: Record<ProductTag, string> = {
  handmade: 'Fait Main',
  luxury: 'Luxe',
  'new-collection': 'Nouvelle Collection',
  bestseller: 'Best-seller',
  promotion: 'Promotion',
};

const validSlugs = [
  'qmiss-jouhara',
  'qmiss-ghourza',
  'caftan',
  'takchita',
  'jelaba',
  'qmayess-rbati',
];

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.category as string;

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const allProducts = getProductsByCategory(slug);
  const cat = categories.find((c) => c.slug === slug);

  const [sort, setSort] = useState<SortOption>('featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<ProductTag[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    );
  };

  const toggleTag = (tag: ProductTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Fabrics available for this category
  const categoryFabrics = Array.from(new Set(allProducts.map((p) => p.fabric).filter(Boolean))) as string[];

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (selectedFabrics.length > 0) {
      result = result.filter((p) => p.fabric && selectedFabrics.includes(p.fabric));
    }

    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.every((tag) => p.tags?.includes(tag))
      );
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (showNewOnly) {
      result = result.filter((p) => p.isNew);
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [allProducts, selectedSubcategory, selectedSizes, selectedFabrics, selectedTags, priceRange, showNewOnly, sort]);

  const activeFilterCount =
    selectedSizes.length +
    selectedFabrics.length +
    selectedTags.length +
    (showNewOnly ? 1 : 0) +
    (selectedSubcategory ? 1 : 0);

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedSubcategory('');
    setSelectedFabrics([]);
    setSelectedTags([]);
    setPriceRange([0, 2000]);
    setShowNewOnly(false);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero banner */}
      <div className="relative bg-emerald pt-24 pb-16 overflow-hidden">
        <MoroccanPattern opacity={0.05} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-3"
          >
            Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl text-white font-bold mb-3"
          >
            {cat?.nameFr || slug}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-arabic text-2xl text-gold mb-4"
          >
            {cat?.nameAr}
          </motion.p>
          <GeometricBorder className="max-w-xs mx-auto opacity-30" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 mt-4 max-w-md mx-auto"
          >
            {cat?.description}
          </motion.p>

          {/* Subcategory pills */}
          {cat?.subcategories && cat.subcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedSubcategory === ''
                    ? 'bg-gold text-white border-gold'
                    : 'border-white/30 text-white/70 hover:border-white hover:text-white'
                }`}
              >
                Tous
              </button>
              {cat.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() => setSelectedSubcategory(sub.slug === selectedSubcategory ? '' : sub.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selectedSubcategory === sub.slug
                      ? 'bg-gold text-white border-gold'
                      : 'border-white/30 text-white/70 hover:border-white hover:text-white'
                  }`}
                >
                  {sub.nameFr}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-cream-300 text-emerald px-4 py-2.5 rounded-full text-sm font-medium hover:border-emerald transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtres
              {activeFilterCount > 0 && (
                <span className="bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            <AnimatePresence>
              {selectedSizes.map((size) => (
                <motion.button
                  key={`size-${size}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleSize(size)}
                  className="flex items-center gap-1 bg-emerald text-white text-xs px-3 py-1.5 rounded-full"
                >
                  {size} <X size={10} />
                </motion.button>
              ))}
              {selectedFabrics.map((fabric) => (
                <motion.button
                  key={`fabric-${fabric}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleFabric(fabric)}
                  className="flex items-center gap-1 bg-gold text-white text-xs px-3 py-1.5 rounded-full"
                >
                  {fabric} <X size={10} />
                </motion.button>
              ))}
              {selectedTags.map((tag) => (
                <motion.button
                  key={`tag-${tag}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-1 bg-emerald/70 text-white text-xs px-3 py-1.5 rounded-full"
                >
                  {tagLabels[tag]} <X size={10} />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-500 hidden sm:block">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            </span>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none bg-white border border-cream-300 text-emerald text-sm px-4 py-2.5 pr-8 rounded-full focus:outline-none focus:border-emerald cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Sizes */}
                <div>
                  <h3 className="font-semibold text-emerald mb-4 text-sm uppercase tracking-wider">
                    Tailles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 h-9 rounded-xl text-xs font-medium border-2 transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-emerald text-white border-emerald'
                            : 'bg-white text-emerald border-cream-300 hover:border-emerald'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fabric */}
                {categoryFabrics.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-emerald mb-4 text-sm uppercase tracking-wider">
                      Tissu / Matière
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categoryFabrics.map((fabric) => (
                        <button
                          key={fabric}
                          onClick={() => toggleFabric(fabric)}
                          className={`px-3 h-9 rounded-xl text-xs font-medium border-2 transition-all ${
                            selectedFabrics.includes(fabric)
                              ? 'bg-gold text-white border-gold'
                              : 'bg-white text-emerald border-cream-300 hover:border-gold'
                          }`}
                        >
                          {fabric}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h3 className="font-semibold text-emerald mb-4 text-sm uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex flex-col gap-2">
                    {(Object.keys(tagLabels) as ProductTag[]).map((tag) => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => toggleTag(tag)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-emerald border-emerald'
                              : 'border-cream-300 group-hover:border-emerald'
                          }`}
                        >
                          {selectedTags.includes(tag) && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-emerald">{tagLabels[tag]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price range + New only */}
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-semibold text-emerald mb-4 text-sm uppercase tracking-wider">
                      Prix (MAD)
                    </h3>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        min={0}
                        max={priceRange[1]}
                        className="w-24 border border-cream-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald"
                        placeholder="Min"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        min={priceRange[0]}
                        max={5000}
                        className="w-24 border border-cream-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-emerald mb-4 text-sm uppercase tracking-wider">
                      Options
                    </h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setShowNewOnly(!showNewOnly)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${
                          showNewOnly ? 'bg-emerald' : 'bg-cream-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            showNewOnly ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </div>
                      <span className="text-sm text-emerald">
                        Nouveautés uniquement
                      </span>
                    </label>
                  </div>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-gold hover:underline text-left"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-serif text-emerald/40 mb-2">
              Aucun produit trouvé
            </p>
            <p className="text-gray-400 text-sm">Essayez d&apos;ajuster vos filtres</p>
            <button
              onClick={resetFilters}
              className="mt-6 text-gold font-medium text-sm hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <ProductCard product={product} priority={i < 4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

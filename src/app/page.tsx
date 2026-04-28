import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustBadges from '@/components/home/TrustBadges';
import InstagramFeed from '@/components/home/InstagramFeed';
import {
  getCategories,
  getFeaturedProducts,
  getNewProducts,
  getBestSellers,
  getPromotions,
} from '@/data/products';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'; // always fresh from JSON

export const metadata: Metadata = {
  title: 'Dar Al Nissaa | Mode Marocaine Authentique & Luxe',
};

export default function HomePage() {
  const categories   = getCategories();
  const featured     = getFeaturedProducts();
  const newProducts  = getNewProducts();
  const bestsellers  = getBestSellers();
  const promotions   = getPromotions();

  return (
    <>
      <Hero />
      <Categories categories={categories} />
      <FeaturedProducts
        featured={featured}
        newProducts={newProducts}
        bestsellers={bestsellers}
        promotions={promotions}
      />
      <TrustBadges />
      <InstagramFeed />
    </>
  );
}

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

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dar Al Nissaa | Mode Marocaine Authentique & Luxe',
};

export default async function HomePage() {
  const [categories, featured, newProducts, bestsellers, promotions] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getNewProducts(),
    getBestSellers(),
    getPromotions(),
  ]);

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

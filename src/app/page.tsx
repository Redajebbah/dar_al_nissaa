import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustBadges from '@/components/home/TrustBadges';
import InstagramFeed from '@/components/home/InstagramFeed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dar Al Nissaa | Mode Marocaine Authentique & Luxe',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <TrustBadges />
      <InstagramFeed />
    </>
  );
}

import { notFound } from 'next/navigation';
import { getProductsByCategory, getCategories } from '@/data/products';
import CollectionPageClient from './CollectionPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === params.category);
  return {
    title: cat ? `${cat.nameFr} | Dar Al Nissaa` : 'Collection | Dar Al Nissaa',
  };
}

export default async function CollectionPage({ params }: Props) {
  const { category } = params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProductsByCategory(category),
  ]);
  const categoryInfo = categories.find((c) => c.slug === category);

  if (!categoryInfo) notFound();

  return <CollectionPageClient products={products} categoryInfo={categoryInfo} />;
}

import { notFound } from 'next/navigation';
import { getProductsByCategory, getCategories } from '@/data/products';
import CollectionPageClient from './CollectionPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'; // always reads fresh JSON

interface Props {
  params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categories = getCategories();
  const cat = categories.find((c) => c.slug === params.category);
  return {
    title: cat ? `${cat.nameFr} | Dar Al Nissaa` : 'Collection | Dar Al Nissaa',
  };
}

export default function CollectionPage({ params }: Props) {
  const { category } = params;
  const categories = getCategories();
  const categoryInfo = categories.find((c) => c.slug === category);

  if (!categoryInfo) notFound();

  const products = getProductsByCategory(category);

  return <CollectionPageClient products={products} categoryInfo={categoryInfo} />;
}

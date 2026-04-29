import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, getCategories } from '@/data/products';
import ProductPageClient from './ProductPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return {
    title: product ? `${product.name.fr} | Dar Al Nissaa` : 'Produit | Dar Al Nissaa',
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, categories] = await Promise.all([
    getRelatedProducts(product),
    getCategories(),
  ]);
  const categoryInfo = categories.find((c) => c.slug === product.category);

  return (
    <ProductPageClient
      product={product}
      related={related}
      categoryInfo={categoryInfo}
    />
  );
}

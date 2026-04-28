import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, getCategories } from '@/data/products';
import ProductPageClient from './ProductPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'; // always reads fresh JSON

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  return {
    title: product ? `${product.name.fr} | Dar Al Nissaa` : 'Produit | Dar Al Nissaa',
  };
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related      = getRelatedProducts(product);
  const categories   = getCategories();
  const categoryInfo = categories.find((c) => c.slug === product.category);

  return (
    <ProductPageClient
      product={product}
      related={related}
      categoryInfo={categoryInfo}
    />
  );
}

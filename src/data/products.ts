import 'server-only';
import redis from '@/lib/redis';
import type { Product, CategoryInfo } from '@/types';

// ─── Redis keys ───────────────────────────────────────────────────────────────
export const PRODUCTS_KEY   = 'products';
export const CATEGORIES_KEY = 'categories';

// ─── Raw read helpers ─────────────────────────────────────────────────────────

async function getProducts(): Promise<Product[]> {
  const data = await redis.get<Product[]>(PRODUCTS_KEY);
  return data ?? [];
}

async function getCategoriesRaw(): Promise<Omit<CategoryInfo, 'count'>[]> {
  const data = await redis.get<Omit<CategoryInfo, 'count'>[]>(CATEGORIES_KEY);
  return data ?? [];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  return getProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.category === category);
}

export async function getProductsBySubcategory(subcategory: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.subcategory === subcategory);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.isFeatured);
}

export async function getNewProducts(limit?: number): Promise<Product[]> {
  const products = await getProducts();
  const items = products.filter((p) => p.isNew);
  return limit ? items.slice(0, limit) : items;
}

export async function getBestSellers(limit?: number): Promise<Product[]> {
  const products = await getProducts();
  const items = products.filter((p) => p.tags?.includes('bestseller'));
  return limit ? items.slice(0, limit) : items;
}

export async function getPromotions(limit?: number): Promise<Product[]> {
  const products = await getProducts();
  const items = products.filter(
    (p) => p.originalPrice !== undefined && p.originalPrice > p.price
  );
  return limit ? items.slice(0, limit) : items;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export async function getAllFabrics(): Promise<string[]> {
  const products = await getProducts();
  return Array.from(
    new Set(products.map((p) => p.fabric).filter(Boolean))
  ) as string[];
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryInfo[]> {
  const [categories, products] = await Promise.all([getCategoriesRaw(), getProducts()]);
  return categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category === cat.slug).length,
  })) as CategoryInfo[];
}

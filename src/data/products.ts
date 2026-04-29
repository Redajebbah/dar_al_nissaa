import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import fs from 'fs';
import path from 'path';
import type { Product, CategoryInfo } from '@/types';

// ─── Data file path ───────────────────────────────────────────────────────────
const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

interface DBData {
  products: Product[];
  categories: Omit<CategoryInfo, 'count'>[];
}

function readData(): DBData {
  noStore(); // ← opt out of ALL Next.js caching — always read fresh from disk
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function getAllProducts(): Product[] {
  return readData().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return readData().products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return readData().products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return readData().products.filter((p) => p.subcategory === subcategory);
}

export function getFeaturedProducts(): Product[] {
  return readData().products.filter((p) => p.isFeatured);
}

export function getNewProducts(limit?: number): Product[] {
  const items = readData().products.filter((p) => p.isNew);
  return limit ? items.slice(0, limit) : items;
}

export function getBestSellers(limit?: number): Product[] {
  const items = readData().products.filter((p) => p.tags?.includes('bestseller'));
  return limit ? items.slice(0, limit) : items;
}

export function getPromotions(limit?: number): Product[] {
  const items = readData().products.filter(
    (p) => p.originalPrice !== undefined && p.originalPrice > p.price
  );
  return limit ? items.slice(0, limit) : items;
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return readData()
    .products.filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function getAllFabrics(): string[] {
  return Array.from(
    new Set(readData().products.map((p) => p.fabric).filter(Boolean))
  ) as string[];
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function getCategories(): CategoryInfo[] {
  const data = readData();
  return data.categories.map((cat) => ({
    ...cat,
    count: data.products.filter((p) => p.category === cat.slug).length,
  })) as CategoryInfo[];
}

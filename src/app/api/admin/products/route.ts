import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import redis from '@/lib/redis';
import { PRODUCTS_KEY, CATEGORIES_KEY } from '@/data/products';
import type { Product } from '@/types';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
}

async function readProducts(): Promise<Product[]> {
  const data = await redis.get<Product[]>(PRODUCTS_KEY);
  return data ?? [];
}

async function writeProducts(products: Product[]) {
  await redis.set(PRODUCTS_KEY, products);
}

function revalidateAll() {
  revalidateTag('products');
  revalidatePath('/', 'layout');
  revalidatePath('/collections/[category]', 'page');
  revalidatePath('/products/[slug]', 'page');
}

// ── GET — list all products + categories ─────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [products, categories] = await Promise.all([
    redis.get<Product[]>(PRODUCTS_KEY),
    redis.get(CATEGORIES_KEY),
  ]);
  return NextResponse.json({ products: products ?? [], categories: categories ?? [] });
}

// ── POST — create product ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const product = await req.json();
    if (!product.id || !product.slug || !product.name?.fr) {
      return NextResponse.json(
        { error: 'Missing required fields: id, slug, name.fr' },
        { status: 400 }
      );
    }
    const products = await readProducts();
    if (products.find((p) => p.id === product.id)) {
      return NextResponse.json({ error: 'Product ID already exists' }, { status: 409 });
    }
    products.push(product);
    await writeProducts(products);
    revalidateAll();
    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

// ── PUT — update product ──────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });

    const products = await readProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    products[idx] = { ...products[idx], ...updates };
    await writeProducts(products);
    revalidateAll();
    return NextResponse.json({ success: true, product: products[idx] });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

// ── DELETE — remove product ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ?id=' }, { status: 400 });

  const products = await readProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  await writeProducts(filtered);
  revalidateAll();
  return NextResponse.json({ success: true });
}

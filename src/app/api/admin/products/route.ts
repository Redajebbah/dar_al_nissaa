import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

function auth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeData(data: unknown) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function revalidateAll() {
  revalidatePath('/', 'layout');
  revalidatePath('/collections/[category]', 'page');
  revalidatePath('/products/[slug]', 'page');
}

// ── GET — list all products ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(readData());
}

// ── POST — create product ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const product = await req.json();
    if (!product.id || !product.slug || !product.name?.fr) {
      return NextResponse.json({ error: 'Missing required fields: id, slug, name.fr' }, { status: 400 });
    }
    const data = readData();
    if (data.products.find((p: { id: string }) => p.id === product.id)) {
      return NextResponse.json({ error: 'Product ID already exists' }, { status: 409 });
    }
    data.products.push(product);
    writeData(data);
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

    const data = readData();
    const idx = data.products.findIndex((p: { id: string }) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    data.products[idx] = { ...data.products[idx], ...updates };
    writeData(data);
    revalidateAll();
    return NextResponse.json({ success: true, product: data.products[idx] });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

// ── DELETE — remove product ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ?id=' }, { status: 400 });

  const data = readData();
  const before = data.products.length;
  data.products = data.products.filter((p: { id: string }) => p.id !== id);
  if (data.products.length === before) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  writeData(data);
  revalidateAll();
  return NextResponse.json({ success: true });
}

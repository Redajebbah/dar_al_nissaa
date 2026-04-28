import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;
    const filename = formData.get('filename') as string | null;

    if (!file || !filename) {
      return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
    }

    // Sanitize filename
    const safe = filename.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
    const dest  = path.join(process.cwd(), 'public', 'products', safe);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dest, buffer);

    return NextResponse.json({ success: true, path: `/products/${safe}` });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

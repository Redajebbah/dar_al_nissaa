import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cloudName    = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: 'Cloudinary not configured (missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET)' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Build multipart form for Cloudinary
    const cloudForm = new FormData();
    cloudForm.append('file', file);
    cloudForm.append('upload_preset', uploadPreset);
    cloudForm.append('folder', 'dar-al-nissaa/products');

    const res  = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: cloudForm }
    );
    const data = await res.json();

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message || 'Cloudinary upload failed' },
        { status: 500 }
      );
    }

    // Return the secure hosted URL — stored directly in the product's images[]
    return NextResponse.json({ success: true, path: data.secure_url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

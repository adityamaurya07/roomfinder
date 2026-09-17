import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'No files uploaded' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.name) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean file name and add unique prefix
      const ext = path.extname(file.name) || '.jpg';
      const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${cleanName}${ext}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} image(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload images' }, { status: 500 });
  }
}

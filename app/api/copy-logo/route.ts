import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export function ensureLogoCopied() {
  try {
    const srcPath = 'C:/Users/hp/.gemini/antigravity/brain/41ee3de0-6009-45a9-a22c-9d3f4bbfb710/.user_uploaded/media_1787393041563.jpg';
    
    const publicDir = path.join(process.cwd(), 'public');
    const publicLogoPath = path.join(publicDir, 'logo.jpg');
    const appFaviconPath = path.join(process.cwd(), 'app', 'favicon.ico');

    if (fs.existsSync(srcPath)) {
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.copyFileSync(srcPath, publicLogoPath);

      // Also copy to app/favicon.ico
      try {
        fs.copyFileSync(srcPath, appFaviconPath);
      } catch (err) {
        console.error('Favicon copy notice:', err);
      }
    }
  } catch (err) {
    console.error('Logo copy error:', err);
  }
}

export async function GET() {
  ensureLogoCopied();
  return NextResponse.json({ success: true, logoPath: '/logo.jpg' });
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.AUTH_SECRET || 'mera-innovation-crm-jwt-secret-key-replace-in-production-2026';
const COOKIE_NAME = 'mera_crm_session';

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function verifyToken(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const enc = new TextEncoder();
    const data = enc.encode(`${encodedHeader}.${encodedPayload}`);

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigStr = base64urlDecode(encodedSignature);
    const sigBytes = new Uint8Array(sigStr.split('').map((c) => c.charCodeAt(0)));

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!isValid) return null;

    const payloadJson = base64urlDecode(encodedPayload);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session = null;

  if (token) {
    session = await verifyToken(token, JWT_SECRET);
  }

  const isAuthPage = pathname.startsWith('/login');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/seed') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.includes('.');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/users') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)'],
};

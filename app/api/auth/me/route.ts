import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/rbac';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}

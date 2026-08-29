import { NextResponse } from 'next/server';
import { checkDuplicateSchool } from '@/lib/duplicate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await checkDuplicateSchool(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Duplicate check API error:', error);
    return NextResponse.json({ hasDuplicate: false, reasons: [] });
  }
}

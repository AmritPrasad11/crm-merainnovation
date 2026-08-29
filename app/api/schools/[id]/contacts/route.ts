import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, designation, email, phone, whatsapp, isPrimary, notes } = body;

    if (!name || !designation) {
      return NextResponse.json({ error: 'Name and designation are required' }, { status: 400 });
    }

    if (isPrimary) {
      // Unset current primary contact for this school
      await db.contact.updateMany({
        where: { schoolId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await db.contact.create({
      data: {
        schoolId: id,
        name,
        designation,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || phone || null,
        isPrimary: !!isPrimary,
        notes: notes || null,
      },
    });

    await db.activity.create({
      data: {
        schoolId: id,
        userId: user.id,
        type: 'SYSTEM',
        title: `Added new contact: ${name} (${designation})`,
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error('Create contact API error:', error);
    return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 });
  }
}

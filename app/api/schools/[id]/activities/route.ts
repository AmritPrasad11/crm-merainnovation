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
    const { type, title, description } = body;

    if (!title) {
      return NextResponse.json({ error: 'Activity title is required' }, { status: 400 });
    }

    const activity = await db.activity.create({
      data: {
        schoolId: id,
        userId: user.id,
        type: type || 'NOTE',
        title,
        description: description || null,
      },
    });

    await db.school.update({
      where: { id },
      data: { lastContactedAt: new Date() },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Create activity API error:', error);
    return NextResponse.json({ error: 'Failed to record activity' }, { status: 500 });
  }
}

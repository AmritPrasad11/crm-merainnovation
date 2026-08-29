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
    const { title, dueDate, assignedUserId, notes } = body;

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'Title and due date are required' }, { status: 400 });
    }

    const followUp = await db.followUp.create({
      data: {
        schoolId: id,
        assignedUserId: assignedUserId || user.id,
        createdById: user.id,
        title,
        dueDate: new Date(dueDate),
        notes: notes || null,
        status: 'PENDING',
      },
    });

    await db.school.update({
      where: { id },
      data: { nextFollowUpAt: new Date(dueDate) },
    });

    await db.activity.create({
      data: {
        schoolId: id,
        userId: user.id,
        type: 'FOLLOW_UP',
        title: `Scheduled follow-up: ${title}`,
        description: `Due on ${new Date(dueDate).toLocaleDateString()}`,
      },
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error) {
    console.error('Schedule follow-up API error:', error);
    return NextResponse.json({ error: 'Failed to schedule follow-up' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { followUpId, status, notes, newDueDate } = body;

    if (!followUpId || !status) {
      return NextResponse.json({ error: 'FollowUp ID and status are required' }, { status: 400 });
    }

    const dataToUpdate: any = {
      status,
      notes: notes || undefined,
    };

    if (status === 'COMPLETED') {
      dataToUpdate.completedAt = new Date();
    }

    if (newDueDate) {
      dataToUpdate.dueDate = new Date(newDueDate);
    }

    const followUp = await db.followUp.update({
      where: { id: followUpId },
      data: dataToUpdate,
    });

    await db.activity.create({
      data: {
        schoolId: id,
        userId: user.id,
        type: 'FOLLOW_UP',
        title: `Follow-up marked as ${status}: ${followUp.title}`,
        description: notes || undefined,
      },
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error) {
    console.error('Update follow-up API error:', error);
    return NextResponse.json({ error: 'Failed to update follow-up status' }, { status: 500 });
  }
}

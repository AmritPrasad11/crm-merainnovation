import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { recalculateSchoolLeadScore } from '@/lib/scoring';
import { logAuditAction } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    const where: any = {};
    if (schoolId) where.schoolId = schoolId;

    const mous = await db.mou.findMany({
      where,
      include: {
        school: { select: { id: true, name: true, city: true, state: true, salesStage: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mous);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch MOU records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schoolId, mouVersion = '1.0', status = 'SENT', documentUrl, notes } = body;

    if (!schoolId) {
      return NextResponse.json({ error: 'School selection is required.' }, { status: 400 });
    }

    const mou = await db.mou.create({
      data: {
        schoolId,
        mouVersion,
        status,
        documentUrl: documentUrl || null,
        sentDate: new Date(),
        notes: notes || null,
        createdById: user.id,
      },
    });

    // Update school stage if MOU is SENT
    if (status === 'SENT') {
      await db.school.update({
        where: { id: schoolId },
        data: { salesStage: 'MOU_SENT', lastContactedAt: new Date() },
      });
    }

    await db.activity.create({
      data: {
        schoolId,
        userId: user.id,
        type: 'MOU',
        title: `MOU version ${mouVersion} dispatched`,
        description: `Status: ${status}`,
      },
    });

    await recalculateSchoolLeadScore(schoolId);

    await logAuditAction({
      userId: user.id,
      action: 'CREATE_MOU',
      entity: 'Mou',
      entityId: mou.id,
      newValue: { schoolId, mouVersion, status },
    });

    return NextResponse.json({ success: true, mou });
  } catch (error) {
    console.error('Create MOU API error:', error);
    return NextResponse.json({ error: 'Failed to create MOU record' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'MOU ID and status required' }, { status: 400 });
    }

    const dataToUpdate: any = {
      status,
      notes: notes || undefined,
    };

    if (status === 'SIGNED') {
      dataToUpdate.signedDate = new Date();
    }

    const updatedMou = await db.mou.update({
      where: { id },
      data: dataToUpdate,
    });

    // Business Rule: If MOU is SIGNED, transition school to MOU_SIGNED
    if (status === 'SIGNED') {
      await db.school.update({
        where: { id: updatedMou.schoolId },
        data: { salesStage: 'MOU_SIGNED', lastContactedAt: new Date() },
      });
    }

    await db.activity.create({
      data: {
        schoolId: updatedMou.schoolId,
        userId: user.id,
        type: 'MOU',
        title: `MOU marked as ${status}`,
        description: status === 'SIGNED' ? 'MOU executed and signed!' : undefined,
      },
    });

    await recalculateSchoolLeadScore(updatedMou.schoolId);

    return NextResponse.json({ success: true, mou: updatedMou });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update MOU' }, { status: 500 });
  }
}

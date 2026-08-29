import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateLeadScore } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

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
    const { newStage, note } = body;

    if (!newStage) {
      return NextResponse.json({ error: 'Sales stage is required' }, { status: 400 });
    }

    const school = await db.school.findUnique({ where: { id } });
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const previousStage = school.salesStage;

    const activitiesCount = await db.activity.count({ where: { schoolId: id } });

    const newScore = calculateLeadScore({
      hasStemLab: school.hasStemLab,
      hasRoboticsLab: school.hasRoboticsLab,
      salesStage: newStage,
      activitiesCount,
    });

    const updatedSchool = await db.school.update({
      where: { id },
      data: {
        salesStage: newStage,
        leadScore: newScore,
        lastContactedAt: new Date(),
        activities: {
          create: {
            userId: user.id,
            type: 'STAGE_CHANGE',
            title: `Sales stage updated to ${newStage}`,
            description: note || `Changed from ${previousStage} to ${newStage} by ${user.name}.`,
          },
        },
      },
    });

    await logAuditAction({
      userId: user.id,
      action: 'UPDATE_SALES_STAGE',
      entity: 'School',
      entityId: id,
      previousValue: { salesStage: previousStage },
      newValue: { salesStage: newStage },
    });

    return NextResponse.json({ success: true, school: updatedSchool });
  } catch (error) {
    console.error('Update stage API error:', error);
    return NextResponse.json({ error: 'Failed to update sales stage' }, { status: 500 });
  }
}

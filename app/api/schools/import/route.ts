import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { normalizeText, calculateLeadScore } from '@/lib/utils';
import { checkDuplicateSchool } from '@/lib/duplicate';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { records, duplicateStrategy = 'SKIP', defaultAssignedUserId } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'No records provided for import.' }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const errors: { rowNumber: number; schoolName: string; reason: string }[] = [];

    const assignedUser = defaultAssignedUserId || currentUser.id;

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      const rowNum = i + 1;
      const schoolName = rec.name?.trim() || '';
      const city = rec.city?.trim() || '';
      const state = rec.state?.trim() || '';

      if (!schoolName || !city || !state) {
        errors.push({
          rowNumber: rowNum,
          schoolName: schoolName || 'Unnamed',
          reason: 'Missing required attributes: School Name, City, or State.',
        });
        continue;
      }

      // Check for duplicate in database
      const dupCheck = await checkDuplicateSchool({
        name: schoolName,
        city,
        state,
        email: rec.contactEmail || undefined,
        phone: rec.contactPhone || undefined,
        website: rec.website || undefined,
      });

      if (dupCheck.hasDuplicate) {
        if (duplicateStrategy === 'SKIP') {
          skippedCount++;
          continue;
        } else if (duplicateStrategy === 'UPDATE_EXISTING' && dupCheck.matchedSchool) {
          // Update existing school
          const existingId = dupCheck.matchedSchool.id;
          await db.school.update({
            where: { id: existingId },
            data: {
              board: rec.board || undefined,
              schoolType: rec.schoolType || undefined,
              studentStrength: rec.studentStrength ? parseInt(rec.studentStrength, 10) : undefined,
              hasStemLab: rec.hasStemLab === 'true' || rec.hasStemLab === true || rec.hasStemLab === 'Yes',
              hasRoboticsLab: rec.hasRoboticsLab === 'true' || rec.hasRoboticsLab === true || rec.hasRoboticsLab === 'Yes',
              primaryEmail: rec.contactEmail || undefined,
              primaryPhone: rec.contactPhone || undefined,
              notes: rec.notes ? `[Import Update]: ${rec.notes}` : undefined,
            },
          });
          updatedCount++;
          continue;
        }
      }

      // Create new school
      const normalizedName = normalizeText(schoolName);
      const initialStage = rec.salesStage || 'NEW';
      const hasStem = rec.hasStemLab === 'true' || rec.hasStemLab === true || rec.hasStemLab === 'Yes' || rec.hasStemLab === '1';
      const hasRobo = rec.hasRoboticsLab === 'true' || rec.hasRoboticsLab === true || rec.hasRoboticsLab === 'Yes' || rec.hasRoboticsLab === '1';

      const leadScore = calculateLeadScore({
        hasStemLab: hasStem,
        hasRoboticsLab: hasRobo,
        salesStage: initialStage,
      });

      await db.school.create({
        data: {
          name: schoolName,
          normalizedName,
          city,
          state,
          address: rec.address || null,
          website: rec.website || null,
          board: rec.board || null,
          schoolType: rec.schoolType || null,
          studentStrength: rec.studentStrength ? parseInt(rec.studentStrength, 10) : null,
          hasStemLab: hasStem,
          hasRoboticsLab: hasRobo,
          primaryEmail: rec.contactEmail || null,
          primaryPhone: rec.contactPhone || null,
          primaryWhatsapp: rec.contactWhatsapp || rec.contactPhone || null,
          source: rec.source || 'CSV Batch Import',
          salesStage: initialStage,
          leadScore,
          assignedUserId: assignedUser,
          createdById: currentUser.id,
          notes: rec.notes || null,
          contacts: rec.contactName
            ? {
                create: [
                  {
                    name: rec.contactName,
                    designation: rec.contactDesignation || 'Principal',
                    email: rec.contactEmail || null,
                    phone: rec.contactPhone || null,
                    whatsapp: rec.contactWhatsapp || rec.contactPhone || null,
                    isPrimary: true,
                  },
                ],
              }
            : undefined,
          activities: {
            create: [
              {
                userId: currentUser.id,
                type: 'SYSTEM',
                title: 'School record added via CSV batch import',
              },
            ],
          },
        },
      });

      importedCount++;
    }

    await logAuditAction({
      userId: currentUser.id,
      action: 'BATCH_IMPORT_SCHOOLS',
      entity: 'School',
      entityId: 'batch',
      newValue: { importedCount, skippedCount, updatedCount, totalRecords: records.length },
    });

    return NextResponse.json({
      success: true,
      totalRecords: records.length,
      importedCount,
      skippedCount,
      updatedCount,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Batch import API error:', error);
    return NextResponse.json({ error: 'Failed to execute batch import.' }, { status: 500 });
  }
}

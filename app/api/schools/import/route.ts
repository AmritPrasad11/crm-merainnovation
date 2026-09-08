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
          // Update existing school attributes safely (never overwrite existing sales stage or CRM history)
          const existingId = dupCheck.matchedSchool.id;
          await db.school.update({
            where: { id: existingId },
            data: {
              address: rec.address || undefined,
              website: rec.website || undefined,
              primaryEmail: rec.contactEmail || undefined,
              primaryPhone: rec.contactPhone || undefined,
            },
          });
          updatedCount++;
          continue;
        }
      }

      // Create new school - ALWAYS starts as NOT_CONTACTED ("School added to CRM, no outreach activity performed yet")
      const normalizedName = normalizeText(schoolName);
      const initialStage = 'NOT_CONTACTED';

      const leadScore = calculateLeadScore({
        hasStemLab: false,
        hasRoboticsLab: false,
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
          primaryEmail: rec.contactEmail || null,
          primaryPhone: rec.contactPhone || null,
          primaryWhatsapp: rec.contactPhone || null,
          source: 'CSV Initial Import',
          salesStage: initialStage as any,
          leadScore,
          assignedUserId: assignedUser,
          createdById: currentUser.id,
          contacts: rec.contactName
            ? {
                create: [
                  {
                    name: rec.contactName,
                    designation: rec.contactDesignation || 'Principal',
                    email: rec.contactEmail || null,
                    phone: rec.contactPhone || null,
                    whatsapp: rec.contactPhone || null,
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
                title: 'School record imported (Status: NOT_CONTACTED)',
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

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { normalizeText } from '@/lib/utils';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schools = await db.school.findMany({
      where: { archived: false },
      include: {
        assignedUser: { select: { name: true } },
        contacts: true,
      },
    });

    const duplicatePairs: any[] = [];
    const seenPairKeys = new Set<string>();

    for (let i = 0; i < schools.length; i++) {
      for (let j = i + 1; j < schools.length; j++) {
        const s1 = schools[i];
        const s2 = schools[j];

        const pairKey = [s1.id, s2.id].sort().join('_');
        if (seenPairKeys.has(pairKey)) continue;

        const reasons: string[] = [];

        // 1. Normalized name match
        if (s1.normalizedName === s2.normalizedName && s1.normalizedName !== '') {
          reasons.push('Identical normalized school name');
        }

        // 2. City + state + fuzzy name
        if (
          normalizeText(s1.city) === normalizeText(s2.city) &&
          normalizeText(s1.state) === normalizeText(s2.state) &&
          (s1.normalizedName.includes(s2.normalizedName) || s2.normalizedName.includes(s1.normalizedName))
        ) {
          reasons.push(`Matching name in ${s1.city}, ${s1.state}`);
        }

        // 3. Email match
        if (s1.primaryEmail && s2.primaryEmail && s1.primaryEmail.toLowerCase() === s2.primaryEmail.toLowerCase()) {
          reasons.push(`Matching primary email: ${s1.primaryEmail}`);
        }

        // 4. Phone match
        if (s1.primaryPhone && s2.primaryPhone && s1.primaryPhone.replace(/[^0-9]/g, '') === s2.primaryPhone.replace(/[^0-9]/g, '')) {
          reasons.push(`Matching primary phone: ${s1.primaryPhone}`);
        }

        if (reasons.length > 0) {
          seenPairKeys.add(pairKey);
          duplicatePairs.push({
            schoolA: s1,
            schoolB: s2,
            reasons,
          });
        }
      }
    }

    return NextResponse.json({ duplicatePairs });
  } catch (error) {
    console.error('Duplicate scan API error:', error);
    return NextResponse.json({ error: 'Failed to scan duplicates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { primarySchoolId, secondarySchoolId } = body;

    if (!primarySchoolId || !secondarySchoolId) {
      return NextResponse.json({ error: 'Primary and Secondary school IDs required.' }, { status: 400 });
    }

    // Merge contacts from secondary to primary
    const secondaryContacts = await db.contact.findMany({ where: { schoolId: secondarySchoolId } });
    for (const c of secondaryContacts) {
      await db.contact.create({
        data: {
          schoolId: primarySchoolId,
          name: c.name,
          designation: c.designation,
          email: c.email,
          phone: c.phone,
          whatsapp: c.whatsapp,
          isPrimary: false,
          notes: `Merged from duplicate school`,
        },
      });
    }

    // Record merge activity
    await db.activity.create({
      data: {
        schoolId: primarySchoolId,
        userId: user.id,
        type: 'SYSTEM',
        title: `Merged duplicate school record`,
        description: `Merged data from duplicate ID ${secondarySchoolId}.`,
      },
    });

    // Archive secondary duplicate school
    await db.school.update({
      where: { id: secondarySchoolId },
      data: { archived: true, notes: `[Merged into school ID ${primarySchoolId}]` },
    });

    await logAuditAction({
      userId: user.id,
      action: 'MERGE_DUPLICATE_SCHOOL',
      entity: 'School',
      entityId: primarySchoolId,
      newValue: { mergedSecondaryId: secondarySchoolId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Merge API error:', error);
    return NextResponse.json({ error: 'Failed to merge duplicate schools' }, { status: 500 });
  }
}

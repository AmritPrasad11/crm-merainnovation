import { db } from './db';

export function computeLeadScore(school: {
  hasStemLab?: boolean;
  hasRoboticsLab?: boolean;
  salesStage?: string;
  activitiesCount?: number;
  proposalsCount?: number;
  hasSignedMou?: boolean;
}): number {
  let score = 0;

  // Base lab presence signal (+15 each)
  if (school.hasStemLab) score += 15;
  if (school.hasRoboticsLab) score += 15;

  // Sales Stage weighting
  switch (school.salesStage) {
    case 'CONTACTED':
      score += 10;
      break;
    case 'ENGAGED':
      score += 25;
      break;
    case 'INTERESTED':
      score += 40;
      break;
    case 'MEETING':
      score += 60;
      break;
    case 'PROPOSAL_SENT':
      score += 75;
      break;
    case 'MOU_SENT':
      score += 85;
      break;
    case 'MOU_SIGNED':
      score += 95;
      break;
    case 'CONVERTED':
      score += 100;
      break;
  }

  // Proposal activity (+25)
  if (school.proposalsCount && school.proposalsCount > 0) {
    score += 25;
  }

  // Signed MOU bonus (+40)
  if (school.hasSignedMou) {
    score += 40;
  }

  // Activity engagement frequency (+5 per activity, capped at +30)
  if (school.activitiesCount) {
    score += Math.min(school.activitiesCount * 5, 30);
  }

  return score;
}

export async function recalculateSchoolLeadScore(schoolId: string): Promise<number> {
  try {
    const school = await db.school.findUnique({
      where: { id: schoolId },
      include: {
        proposals: true,
        mous: true,
        activities: true,
      },
    });

    if (!school) return 0;

    const proposalsCount = school.proposals.length;
    const hasSignedMou = school.mous.some((m: any) => m.status === 'SIGNED');
    const activitiesCount = school.activities.length;

    const newScore = computeLeadScore({
      hasStemLab: school.hasStemLab,
      hasRoboticsLab: school.hasRoboticsLab,
      salesStage: school.salesStage,
      activitiesCount,
      proposalsCount,
      hasSignedMou,
    });

    await db.school.update({
      where: { id: schoolId },
      data: { leadScore: newScore },
    });

    return newScore;
  } catch (error) {
    console.error('Lead score recalculation error:', error);
    return 0;
  }
}

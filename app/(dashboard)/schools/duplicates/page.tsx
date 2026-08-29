import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import DuplicateHubClient from '@/components/DuplicateHubClient';
import { normalizeText } from '@/lib/utils';

export default async function DuplicatesPage() {
  const user = await getCurrentUser();

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

      if (s1.normalizedName === s2.normalizedName && s1.normalizedName !== '') {
        reasons.push('Identical normalized school name');
      }

      if (
        normalizeText(s1.city) === normalizeText(s2.city) &&
        normalizeText(s1.state) === normalizeText(s2.state) &&
        (s1.normalizedName.includes(s2.normalizedName) || s2.normalizedName.includes(s1.normalizedName))
      ) {
        reasons.push(`Matching name in ${s1.city}, ${s1.state}`);
      }

      if (s1.primaryEmail && s2.primaryEmail && s1.primaryEmail.toLowerCase() === s2.primaryEmail.toLowerCase()) {
        reasons.push(`Matching primary email: ${s1.primaryEmail}`);
      }

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

  return <DuplicateHubClient initialPairs={duplicatePairs} />;
}

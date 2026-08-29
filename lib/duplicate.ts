import { db } from './db';
import { normalizeText } from './utils';

export interface DuplicateCheckInput {
  name: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  website?: string;
  excludeSchoolId?: string;
}

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  reasons: string[];
  matchedSchool?: {
    id: string;
    name: string;
    city: string;
    state: string;
    salesStage: string;
  };
}

export async function checkDuplicateSchool(
  input: DuplicateCheckInput
): Promise<DuplicateCheckResult> {
  const normalizedInputName = normalizeText(input.name);
  if (!normalizedInputName) {
    return { hasDuplicate: false, reasons: [] };
  }

  // Fetch candidate schools from DB
  const candidates = await db.school.findMany({
    where: {
      archived: false,
      id: input.excludeSchoolId ? { not: input.excludeSchoolId } : undefined,
    },
    select: {
      id: true,
      name: true,
      normalizedName: true,
      city: true,
      state: true,
      primaryEmail: true,
      primaryPhone: true,
      website: true,
      salesStage: true,
    },
  });

  const reasons: string[] = [];
  let matchedSchool: (typeof candidates)[0] | undefined;

  const inputEmail = input.email?.trim().toLowerCase();
  const inputPhone = input.phone?.replace(/[^0-9]/g, '');
  const inputWebsite = input.website?.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  for (const school of candidates) {
    const isSameCityState =
      input.city &&
      input.state &&
      normalizeText(school.city) === normalizeText(input.city) &&
      normalizeText(school.state) === normalizeText(input.state);

    const isNameMatch =
      school.normalizedName === normalizedInputName ||
      (isSameCityState && school.normalizedName.includes(normalizedInputName));

    if (isNameMatch) {
      reasons.push(`School name "${school.name}" closely matches an existing record in ${school.city}, ${school.state}.`);
      matchedSchool = school;
      break;
    }

    if (inputEmail && school.primaryEmail && school.primaryEmail.toLowerCase() === inputEmail) {
      reasons.push(`Email address "${inputEmail}" is already associated with "${school.name}".`);
      matchedSchool = school;
      break;
    }

    if (inputPhone && school.primaryPhone) {
      const cleanSchoolPhone = school.primaryPhone.replace(/[^0-9]/g, '');
      if (cleanSchoolPhone && cleanSchoolPhone.length >= 7 && cleanSchoolPhone === inputPhone) {
        reasons.push(`Phone number "${input.phone}" is already associated with "${school.name}".`);
        matchedSchool = school;
        break;
      }
    }

    if (inputWebsite && school.website) {
      const cleanSchoolWebsite = school.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (cleanSchoolWebsite && cleanSchoolWebsite === inputWebsite) {
        reasons.push(`Website URL "${input.website}" is already registered to "${school.name}".`);
        matchedSchool = school;
        break;
      }
    }
  }

  return {
    hasDuplicate: reasons.length > 0,
    reasons,
    matchedSchool: matchedSchool
      ? {
          id: matchedSchool.id,
          name: matchedSchool.name,
          city: matchedSchool.city,
          state: matchedSchool.state,
          salesStage: matchedSchool.salesStage,
        }
      : undefined,
  };
}

export function cn(...inputs: (string | boolean | undefined | null | { [key: string]: boolean })[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, val] of Object.entries(input)) {
        if (val) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');
}

export function calculateLeadScore(school: {
  hasStemLab?: boolean;
  hasRoboticsLab?: boolean;
  salesStage?: string;
  activitiesCount?: number;
}): number {
  let score = 0;

  // Base lab presence signal
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

  // Activity frequency bonus
  if (school.activitiesCount) {
    score += Math.min(school.activitiesCount * 5, 30);
  }

  return score;
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCSVText(csvText: string): CSVParseResult {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let field = '';
    let inQ = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if ((c === ',' || c === '\t') && !inQ) {
        result.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    result.push(field.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]).map((v) => v.replace(/^"|"$/g, '').trim());
    if (values.every((v) => v === '')) continue; // skip empty rows

    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export const CRM_IMPORT_FIELDS: { key: string; label: string; required: boolean; description: string }[] = [
  { key: 'name', label: 'School Name', required: true, description: 'Official name of the school' },
  { key: 'city', label: 'City', required: true, description: 'City location' },
  { key: 'state', label: 'State', required: true, description: 'State location' },
  { key: 'address', label: 'Address', required: false, description: 'Street address' },
  { key: 'website', label: 'Website', required: false, description: 'School website URL' },
  { key: 'board', label: 'Board', required: false, description: 'CBSE, ICSE, State Board, etc.' },
  { key: 'schoolType', label: 'School Type', required: false, description: 'Private, Government, Trust, etc.' },
  { key: 'studentStrength', label: 'Student Strength', required: false, description: 'Approximate student count' },
  { key: 'hasStemLab', label: 'Existing STEM Lab', required: false, description: 'Yes / No / True / False' },
  { key: 'hasRoboticsLab', label: 'Existing Robotics Lab', required: false, description: 'Yes / No / True / False' },
  { key: 'contactName', label: 'Contact Person Name', required: false, description: 'Principal or Coordinator name' },
  { key: 'contactDesignation', label: 'Contact Designation', required: false, description: 'Principal, STEM Coordinator, etc.' },
  { key: 'contactEmail', label: 'Contact Email', required: false, description: 'Email address' },
  { key: 'contactPhone', label: 'Contact Phone', required: false, description: 'Phone number' },
  { key: 'contactWhatsapp', label: 'WhatsApp Number', required: false, description: 'WhatsApp contact number' },
  { key: 'source', label: 'Lead Source', required: false, description: 'Source of the record' },
  { key: 'salesStage', label: 'Sales Stage', required: false, description: 'Initial sales stage' },
  { key: 'notes', label: 'Notes', required: false, description: 'Additional notes' },
];

export function autoDetectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  const fieldPatterns: Record<string, RegExp[]> = {
    name: [/school\s*name/i, /institution/i, /school/i, /name/i],
    city: [/city/i, /district/i, /location/i],
    state: [/state/i, /region/i, /province/i],
    address: [/address/i, /street/i, /location\s*address/i],
    website: [/website/i, /url/i, /domain/i, /web/i],
    board: [/board/i, /affiliation/i, /curriculum/i],
    schoolType: [/type/i, /category/i, /school\s*type/i],
    studentStrength: [/strength/i, /students/i, /count/i, /capacity/i],
    hasStemLab: [/stem\s*lab/i, /stem/i],
    hasRoboticsLab: [/robotics\s*lab/i, /robotics/i],
    contactName: [/contact\s*name/i, /principal/i, /person/i, /coordinator/i, /contact/i],
    contactDesignation: [/designation/i, /role/i, /title/i, /position/i],
    contactEmail: [/email/i, /mail/i, /contact\s*email/i],
    contactPhone: [/phone/i, /mobile/i, /contact\s*number/i, /tel/i],
    contactWhatsapp: [/whatsapp/i, /wa\s*number/i],
    source: [/source/i, /channel/i, /origin/i],
    salesStage: [/stage/i, /sales\s*stage/i, /status/i],
    notes: [/note/i, /comment/i, /remark/i],
  };

  const usedFields = new Set<string>();

  for (const header of headers) {
    for (const [fieldKey, patterns] of Object.entries(fieldPatterns)) {
      if (usedFields.has(fieldKey)) continue;
      for (const pattern of patterns) {
        if (pattern.test(header)) {
          mapping[header] = fieldKey;
          usedFields.add(fieldKey);
          break;
        }
      }
      if (mapping[header]) break;
    }
  }

  return mapping;
}

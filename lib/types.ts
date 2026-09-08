export type Role = 'ADMIN' | 'OUTREACH_USER';

export type SalesStage =
  | 'NOT_CONTACTED'
  | 'NEW'
  | 'CONTACTED'
  | 'ENGAGED'
  | 'INTERESTED'
  | 'MEETING'
  | 'PROPOSAL_SENT'
  | 'MOU_SENT'
  | 'MOU_SIGNED'
  | 'CONVERTED'
  | 'NOT_INTERESTED'
  | 'REJECTED'
  | 'NO_RESPONSE'
  | 'INVALID_CONTACT';

export type ActivityType =
  | 'CALL'
  | 'MEETING'
  | 'NOTE'
  | 'FOLLOW_UP'
  | 'PROPOSAL'
  | 'MOU'
  | 'STAGE_CHANGE'
  | 'EMAIL_SENT'
  | 'WHATSAPP_SENT'
  | 'SYSTEM';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export type ProposalStatus = 'DRAFT' | 'SENT' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export type MouStatus = 'NOT_SENT' | 'SENT' | 'UNDER_REVIEW' | 'SIGNED' | 'REJECTED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive?: boolean;
  lastLoginAt?: string | Date | null;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count: {
    assignedSchools: number;
    followUps: number;
  };
}

export const SALES_STAGE_PIPELINE: { key: SalesStage; label: string; color: string; description: string }[] = [
  { key: 'NOT_CONTACTED', label: 'Not Contacted', color: 'bg-slate-100 text-slate-800 border-slate-300', description: 'Newly added school, no outreach activity performed yet' },
  { key: 'NEW', label: 'New', color: 'bg-slate-100 text-slate-800 border-slate-300', description: 'Newly added school record' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-blue-50 text-blue-700 border-blue-200', description: 'Initial outreach sent (Email/WhatsApp/Call)' },
  { key: 'ENGAGED', label: 'Engaged', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', description: 'School responded or engaged with communication' },
  { key: 'INTERESTED', label: 'Interested', color: 'bg-amber-50 text-amber-700 border-amber-200', description: 'Confirmed interest in STEM/Robotics solutions' },
  { key: 'MEETING', label: 'Meeting', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', description: 'Presentation or meeting conducted' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-purple-50 text-purple-700 border-purple-200', description: 'Commercial proposal delivered' },
  { key: 'MOU_SENT', label: 'MOU Sent', color: 'bg-pink-50 text-pink-700 border-pink-200', description: 'MOU draft dispatched for review' },
  { key: 'MOU_SIGNED', label: 'MOU Signed', color: 'bg-teal-50 text-teal-700 border-teal-200', description: 'MOU successfully executed' },
  { key: 'CONVERTED', label: 'Converted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', description: 'Onboarded & Converted partner school' },
];

export const SALES_STAGE_OUTCOMES: { key: SalesStage; label: string; color: string }[] = [
  { key: 'NOT_INTERESTED', label: 'Not Interested', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
  { key: 'NO_RESPONSE', label: 'No Response', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { key: 'INVALID_CONTACT', label: 'Invalid Contact', color: 'bg-orange-50 text-orange-700 border-orange-200' },
];

export const CONTACT_DESIGNATIONS = [
  'Principal',
  'Vice Principal',
  'STEM Coordinator',
  'Robotics Coordinator',
  'Director',
  'Management',
  'Trustee',
  'Other',
];

export const SCHOOL_BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'];

export const SCHOOL_TYPES = ['Private', 'Government', 'Trust / Foundation', 'International', 'Other'];

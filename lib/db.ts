import { PrismaClient } from '@prisma/client';
import { normalizeText, calculateLeadScore } from './utils';

// Global in-memory storage for development fallback when DATABASE_URL is missing in dev
const inMemoryStore: {
  users: any[];
  schools: any[];
  contacts: any[];
  activities: any[];
  followUps: any[];
  proposals: any[];
  mous: any[];
  templates: any[];
  campaigns: any[];
  campaignRecipients: any[];
  messageLogs: any[];
  auditLogs: any[];
} = {
  users: [
    {
      id: 'usr_admin',
      name: 'Mera Admin',
      email: 'admin@merainnovation.com',
      passwordHash: 'c7c2518e950893047c05eb7614d9b3e1ddb8b548b813b5bf5704179373059082',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'usr_amrit',
      name: 'Amrit',
      email: 'amrit@merainnovation.com',
      passwordHash: 'f4f107f9c8f0e5728a38a0a8677c7f39572b6b553e19488a4b64e528a475d654',
      role: 'OUTREACH_USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  schools: [
    {
      id: 'sch_1',
      name: 'St. Xavier Public School',
      normalizedName: 'stxavierpublicschool',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'C-Scheme, Main Road',
      website: 'www.stxaviersjaipur.edu.in',
      board: 'CBSE',
      schoolType: 'Private',
      studentStrength: 2400,
      hasStemLab: true,
      hasRoboticsLab: false,
      primaryEmail: 'info@stxaviersjaipur.edu.in',
      primaryPhone: '+91 98290 12345',
      primaryWhatsapp: '+91 98290 12345',
      source: 'Cold Outreach',
      salesStage: 'INTERESTED',
      leadScore: 65,
      archived: false,
      assignedUserId: 'usr_amrit',
      createdById: 'usr_admin',
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(),
      lastContactedAt: new Date(Date.now() - 2 * 86400000),
      nextFollowUpAt: new Date(Date.now() + 86400000),
      notes: 'Interested in upgrading robotics curriculum for classes 6 to 10.',
    },
    {
      id: 'sch_2',
      name: 'Delhi Public School',
      normalizedName: 'delhipublicschool',
      city: 'Indore',
      state: 'Madhya Pradesh',
      address: 'Nipania Bypass Road',
      website: 'www.dpsindore.org',
      board: 'CBSE',
      schoolType: 'Private',
      studentStrength: 3200,
      hasStemLab: true,
      hasRoboticsLab: true,
      primaryEmail: 'contact@dpsindore.org',
      primaryPhone: '+91 731 290 9999',
      primaryWhatsapp: '+91 731 290 9999',
      source: 'Direct Website Lead',
      salesStage: 'PROPOSAL_SENT',
      leadScore: 85,
      archived: false,
      assignedUserId: 'usr_amrit',
      createdById: 'usr_admin',
      createdAt: new Date(Date.now() - 10 * 86400000),
      updatedAt: new Date(),
      lastContactedAt: new Date(Date.now() - 1 * 86400000),
      nextFollowUpAt: new Date(),
      notes: 'Proposal sent on 20th. Scheduled follow-up with Management Trustee.',
    },
  ],
  contacts: [
    {
      id: 'cnt_1',
      schoolId: 'sch_1',
      name: 'Dr. R. K. Sharma',
      designation: 'Principal',
      email: 'principal@stxaviersjaipur.edu.in',
      phone: '+91 98290 12345',
      whatsapp: '+91 98290 12345',
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cnt_2',
      schoolId: 'sch_2',
      name: 'Anjali Gupta',
      designation: 'Director',
      email: 'director@dpsindore.org',
      phone: '+91 731 290 9999',
      whatsapp: '+91 731 290 9999',
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  activities: [
    {
      id: 'act_1',
      schoolId: 'sch_1',
      userId: 'usr_amrit',
      type: 'CALL',
      title: 'Initial phone call completed',
      description: 'Spoke with Dr. R. K. Sharma. Explained Mera Innovation STEM lab setup.',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
  ],
  followUps: [
    {
      id: 'fu_1',
      schoolId: 'sch_1',
      assignedUserId: 'usr_amrit',
      createdById: 'usr_admin',
      title: 'Send customized Robotics Lab proposal & brochure',
      dueDate: new Date(Date.now() + 86400000),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'fu_2',
      schoolId: 'sch_2',
      assignedUserId: 'usr_amrit',
      createdById: 'usr_admin',
      title: 'Follow up on proposal review with Director Anjali Gupta',
      dueDate: new Date(),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  proposals: [],
  mous: [],
  templates: [
    {
      id: 'tpl_1',
      name: 'STEM & Robotics Lab Introduction',
      channel: 'EMAIL',
      subject: 'Transforming STEM & Robotics Education at {{school_name}}',
      content:
        'Dear {{contact_name}},\n\nGreetings from Mera Innovation!\n\nWe specialize in setting up state-of-the-art STEM & Robotics labs for premier schools in {{city}}. We would love to collaborate with {{school_name}} to introduce hands-on AI and Robotics modules for your students.\n\nBest regards,\n{{assigned_user}}\nMera Innovation Team',
      variables: 'school_name,contact_name,city,assigned_user',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'tpl_2',
      name: 'Meta WhatsApp Quick Demo Request',
      channel: 'WHATSAPP',
      subject: null,
      content:
        'Hello {{contact_name}}! We are reaching out from Mera Innovation regarding setting up an advanced Robotics Lab at {{school_name}} in {{city}}. Would you be available for a brief 10-minute demo session this week?',
      variables: 'contact_name,school_name,city',
      metaTemplateId: 'mera_robotics_demo_intro',
      metaStatus: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  campaigns: [],
  campaignRecipients: [],
  messageLogs: [
    {
      id: 'msg_1',
      schoolId: 'sch_1',
      contactId: 'cnt_1',
      channel: 'EMAIL',
      direction: 'OUTBOUND',
      sender: 'outreach@merainnovation.com',
      recipient: 'principal@stxaviersjaipur.edu.in',
      subject: 'Transforming STEM & Robotics Education at St. Xavier Public School',
      content: 'Sent initial STEM lab brochure and introduction.',
      status: 'DELIVERED',
      externalId: 'msg_resend_9921',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      id: 'msg_2',
      schoolId: 'sch_2',
      contactId: 'cnt_2',
      channel: 'WHATSAPP',
      direction: 'OUTBOUND',
      sender: 'Meta Cloud API',
      recipient: '+91 731 290 9999',
      subject: null,
      content: 'Hello Anjali Gupta! Following up on the commercial proposal for DPS Indore.',
      status: 'READ',
      externalId: 'wamid.HBgLOTE3MzEyOTA5OTk5FQIAERgSRTI0RDAyMjQ1MTQ5NDBDMEI1AA==',
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
  ],
  auditLogs: [],
};

// Fallback Prisma-like mock store for local development only
const fallbackDb = {
  user: {
    findUnique: async ({ where }: any) =>
      inMemoryStore.users.find(
        (u) => (where?.email && u.email.toLowerCase() === where.email.toLowerCase()) || (where?.id && u.id === where.id)
      ) || null,
    findMany: async (args?: any) => {
      let result = [...inMemoryStore.users];
      return result.map((u) => ({
        ...u,
        _count: {
          assignedSchools: inMemoryStore.schools.filter((s) => s.assignedUserId === u.id).length,
          followUps: inMemoryStore.followUps.filter((f) => f.assignedUserId === u.id && f.status === 'PENDING').length,
        },
      }));
    },
    create: async ({ data }: any) => {
      const newUser = { id: `usr_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.users.push(newUser);
      return newUser;
    },
  },
  school: {
    findUnique: async ({ where, include }: any) => {
      const s = inMemoryStore.schools.find((sch) => sch.id === where?.id);
      if (!s) return null;
      return {
        ...s,
        assignedUser: inMemoryStore.users.find((u) => u.id === s.assignedUserId) || null,
        createdBy: inMemoryStore.users.find((u) => u.id === s.createdById) || null,
        contacts: inMemoryStore.contacts.filter((c) => c.schoolId === s.id),
        activities: inMemoryStore.activities
          .filter((a) => a.schoolId === s.id)
          .map((a) => ({ ...a, user: inMemoryStore.users.find((u) => u.id === a.userId) || null })),
        followUps: inMemoryStore.followUps
          .filter((f) => f.schoolId === s.id)
          .map((f) => ({ ...f, assignedUser: inMemoryStore.users.find((u) => u.id === f.assignedUserId) || null })),
        proposals: inMemoryStore.proposals.filter((p) => p.schoolId === s.id),
        mous: inMemoryStore.mous.filter((m) => m.schoolId === s.id),
        messageLogs: inMemoryStore.messageLogs.filter((m) => m.schoolId === s.id),
      };
    },
    findMany: async (args?: any) => {
      let list = inMemoryStore.schools.filter((s) => !s.archived);

      if (args?.where?.OR) {
        const q = args.where.OR[0]?.name?.contains?.toLowerCase() || '';
        if (q) {
          list = list.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.city.toLowerCase().includes(q) ||
              s.state.toLowerCase().includes(q) ||
              (s.primaryEmail && s.primaryEmail.toLowerCase().includes(q))
          );
        }
      }

      if (args?.where?.salesStage) {
        list = list.filter((s) => s.salesStage === args.where.salesStage);
      }

      if (args?.where?.board) {
        list = list.filter((s) => s.board === args.where.board);
      }

      return list.map((s) => ({
        ...s,
        assignedUser: inMemoryStore.users.find((u) => u.id === s.assignedUserId) || null,
        contacts: inMemoryStore.contacts.filter((c) => c.schoolId === s.id && (args?.include?.contacts?.where?.isPrimary ? c.isPrimary : true)),
        _count: {
          contacts: inMemoryStore.contacts.filter((c) => c.schoolId === s.id).length,
          followUps: inMemoryStore.followUps.filter((f) => f.schoolId === s.id).length,
        },
      }));
    },
    groupBy: async ({ by }: any) => {
      const counts: Record<string, number> = {};
      inMemoryStore.schools.forEach((s) => {
        if (!s.archived) {
          counts[s.salesStage] = (counts[s.salesStage] || 0) + 1;
        }
      });
      return Object.entries(counts).map(([salesStage, count]) => ({
        salesStage,
        _count: { id: count },
      }));
    },
    count: async ({ where }: any) => {
      if (where?.archived === false) return inMemoryStore.schools.filter((s) => !s.archived).length;
      return inMemoryStore.schools.length;
    },
    create: async ({ data }: any) => {
      const { contacts, activities, followUps, ...schoolData } = data;
      const newSchool = {
        id: `sch_${Date.now()}`,
        ...schoolData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryStore.schools.push(newSchool);

      if (contacts?.create) {
        contacts.create.forEach((c: any) => {
          inMemoryStore.contacts.push({ id: `cnt_${Date.now()}_${Math.random()}`, schoolId: newSchool.id, ...c, createdAt: new Date(), updatedAt: new Date() });
        });
      }

      if (activities?.create) {
        activities.create.forEach((a: any) => {
          inMemoryStore.activities.push({ id: `act_${Date.now()}_${Math.random()}`, schoolId: newSchool.id, ...a, createdAt: new Date() });
        });
      }

      if (followUps?.create) {
        followUps.create.forEach((f: any) => {
          inMemoryStore.followUps.push({ id: `fu_${Date.now()}_${Math.random()}`, schoolId: newSchool.id, ...f, createdAt: new Date(), updatedAt: new Date() });
        });
      }

      return newSchool;
    },
    update: async ({ where, data }: any) => {
      const school = inMemoryStore.schools.find((s) => s.id === where.id);
      if (!school) throw new Error('School not found');

      const { activities, ...updateFields } = data;
      Object.assign(school, updateFields, { updatedAt: new Date() });

      if (activities?.create) {
        inMemoryStore.activities.push({
          id: `act_${Date.now()}`,
          schoolId: school.id,
          ...activities.create,
          createdAt: new Date(),
        });
      }

      return school;
    },
  },
  contact: {
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.contacts];
      if (args?.where?.designation) {
        list = list.filter((c) => c.designation === args.where.designation);
      }
      return list.map((c) => ({
        ...c,
        school: inMemoryStore.schools.find((s) => s.id === c.schoolId) || { name: 'Unknown', city: '', state: '' },
      }));
    },
    create: async ({ data }: any) => {
      const newContact = { id: `cnt_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.contacts.push(newContact);
      return newContact;
    },
    updateMany: async ({ where, data }: any) => {
      inMemoryStore.contacts.forEach((c) => {
        if (c.schoolId === where.schoolId && where.isPrimary && c.isPrimary) {
          c.isPrimary = data.isPrimary;
        }
      });
      return { count: 1 };
    },
  },
  activity: {
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.activities];
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      if (args?.take) list = list.slice(0, args.take);
      return list.map((a) => ({
        ...a,
        school: inMemoryStore.schools.find((s) => s.id === a.schoolId) || { id: a.schoolId, name: 'School' },
        user: inMemoryStore.users.find((u) => u.id === a.userId) || null,
      }));
    },
    count: async ({ where }: any) => inMemoryStore.activities.filter((a) => a.schoolId === where?.schoolId).length,
    create: async ({ data }: any) => {
      const newAct = { id: `act_${Date.now()}`, ...data, createdAt: new Date() };
      inMemoryStore.activities.push(newAct);
      return newAct;
    },
  },
  followUp: {
    count: async ({ where }: any) => {
      return inMemoryStore.followUps.filter((f) => {
        if (f.status !== where?.status) return false;
        if (where?.dueDate?.lt) return new Date(f.dueDate) < new Date(where.dueDate.lt);
        if (where?.dueDate?.gte && where?.dueDate?.lte) {
          const d = new Date(f.dueDate);
          return d >= new Date(where.dueDate.gte) && d <= new Date(where.dueDate.lte);
        }
        return true;
      }).length;
    },
    findMany: async (args?: any) => {
      let list = inMemoryStore.followUps.filter((f) => {
        if (args?.where?.status && f.status !== args.where.status) return false;
        if (args?.where?.dueDate?.lt) return new Date(f.dueDate) < new Date(args.where.dueDate.lt);
        if (args?.where?.dueDate?.gt) return new Date(f.dueDate) > new Date(args.where.dueDate.gt);
        if (args?.where?.dueDate?.gte && args?.where?.dueDate?.lte) {
          const d = new Date(f.dueDate);
          return d >= new Date(args.where.dueDate.gte) && d <= new Date(args.where.dueDate.lte);
        }
        return true;
      });

      if (args?.orderBy?.dueDate === 'asc') {
        list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      }
      if (args?.take) list = list.slice(0, args.take);

      return list.map((f) => ({
        ...f,
        school: inMemoryStore.schools.find((s) => s.id === f.schoolId) || { id: f.schoolId, name: 'School' },
        assignedUser: inMemoryStore.users.find((u) => u.id === f.assignedUserId) || null,
      }));
    },
    create: async ({ data }: any) => {
      const newFu = { id: `fu_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.followUps.push(newFu);
      return newFu;
    },
    update: async ({ where, data }: any) => {
      const fu = inMemoryStore.followUps.find((f) => f.id === where.id);
      if (fu) Object.assign(fu, data, { updatedAt: new Date() });
      return fu;
    },
  },
  proposal: {
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.proposals];
      if (args?.where?.schoolId) list = list.filter((p) => p.schoolId === args.where.schoolId);
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list.map((p) => ({
        ...p,
        school: inMemoryStore.schools.find((s) => s.id === p.schoolId) || { id: p.schoolId, name: 'School', city: '', state: '' },
        createdBy: inMemoryStore.users.find((u) => u.id === p.createdById) || null,
      }));
    },
    create: async ({ data }: any) => {
      const newProp = { id: `prop_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.proposals.push(newProp);
      return newProp;
    },
    update: async ({ where, data }: any) => {
      const p = inMemoryStore.proposals.find((prop) => prop.id === where.id);
      if (p) Object.assign(p, data, { updatedAt: new Date() });
      return p;
    },
  },
  mou: {
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.mous];
      if (args?.where?.schoolId) list = list.filter((m) => m.schoolId === args.where.schoolId);
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list.map((m) => ({
        ...m,
        school: inMemoryStore.schools.find((s) => s.id === m.schoolId) || { id: m.schoolId, name: 'School', city: '', state: '', salesStage: 'MOU_SENT' },
        createdBy: inMemoryStore.users.find((u) => u.id === m.createdById) || null,
      }));
    },
    create: async ({ data }: any) => {
      const newMou = { id: `mou_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.mous.push(newMou);
      return newMou;
    },
    update: async ({ where, data }: any) => {
      const m = inMemoryStore.mous.find((mou) => mou.id === where.id);
      if (m) Object.assign(m, data, { updatedAt: new Date() });
      return m;
    },
  },
  template: {
    findUnique: async ({ where }: any) => inMemoryStore.templates.find((t) => t.id === where?.id) || null,
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.templates];
      if (args?.where?.channel) list = list.filter((t) => t.channel === args.where.channel);
      return list;
    },
    create: async ({ data }: any) => {
      const newTpl = { id: `tpl_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.templates.push(newTpl);
      return newTpl;
    },
    delete: async ({ where }: any) => {
      inMemoryStore.templates = inMemoryStore.templates.filter((t) => t.id !== where.id);
      return { id: where.id };
    },
  },
  campaign: {
    findUnique: async ({ where }: any) => {
      const c = inMemoryStore.campaigns.find((cmp) => cmp.id === where?.id);
      if (!c) return null;
      return {
        ...c,
        template: inMemoryStore.templates.find((t) => t.id === c.templateId) || null,
        createdBy: inMemoryStore.users.find((u) => u.id === c.createdById) || null,
        recipients: inMemoryStore.campaignRecipients
          .filter((r) => r.campaignId === c.id)
          .map((r) => ({
            ...r,
            school: inMemoryStore.schools.find((s) => s.id === r.schoolId) || null,
          })),
      };
    },
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.campaigns];
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list.map((c) => ({
        ...c,
        template: inMemoryStore.templates.find((t) => t.id === c.templateId) || null,
        createdBy: inMemoryStore.users.find((u) => u.id === c.createdById) || null,
      }));
    },
    create: async ({ data }: any) => {
      const { recipients, ...campData } = data;
      const newCamp = { id: `cmp_${Date.now()}`, ...campData, createdAt: new Date(), updatedAt: new Date() };
      inMemoryStore.campaigns.push(newCamp);

      if (recipients?.create) {
        recipients.create.forEach((r: any) => {
          inMemoryStore.campaignRecipients.push({
            id: `rec_${Date.now()}_${Math.random()}`,
            campaignId: newCamp.id,
            ...r,
            createdAt: new Date(),
          });
        });
      }

      return newCamp;
    },
    update: async ({ where, data }: any) => {
      const c = inMemoryStore.campaigns.find((cmp) => cmp.id === where.id);
      if (c) Object.assign(c, data, { updatedAt: new Date() });
      return c;
    },
  },
  campaignRecipient: {
    updateMany: async ({ where, data }: any) => {
      inMemoryStore.campaignRecipients.forEach((r) => {
        if (r.campaignId === where.campaignId) {
          Object.assign(r, data);
        }
      });
      return { count: 1 };
    },
  },
  messageLog: {
    findMany: async (args?: any) => {
      let list = [...inMemoryStore.messageLogs];
      if (args?.where?.schoolId) list = list.filter((m) => m.schoolId === args.where.schoolId);
      if (args?.where?.channel) list = list.filter((m) => m.channel === args.where.channel);
      if (args?.orderBy?.createdAt === 'desc') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return list.map((m) => ({
        ...m,
        school: inMemoryStore.schools.find((s) => s.id === m.schoolId) || { name: 'Unknown' },
        contact: inMemoryStore.contacts.find((c) => c.id === m.contactId) || null,
      }));
    },
    create: async ({ data }: any) => {
      const newMsg = { id: `msg_${Date.now()}`, ...data, createdAt: new Date() };
      inMemoryStore.messageLogs.push(newMsg);
      return newMsg;
    },
  },
  auditLog: {
    create: async ({ data }: any) => {
      const newLog = { id: `audit_${Date.now()}`, ...data, createdAt: new Date() };
      inMemoryStore.auditLogs.push(newLog);
      return newLog;
    },
  },
};

// Standard Prisma singleton pattern for Next.js development hot-reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function initializeDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  if (isProduction) {
    if (!hasDatabaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is missing. Production environment requires a valid PostgreSQL connection string.'
      );
    }
    try {
      const client = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
      globalForPrisma.prisma = client;
      return client;
    } catch (err: any) {
      throw new Error(
        `Failed to initialize Prisma Client in production environment: ${err?.message || err}`
      );
    }
  }

  // Development / Test environment
  if (hasDatabaseUrl) {
    try {
      const client = globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
      }
      return client;
    } catch (err: any) {
      console.warn(
        '[CRM Database] PrismaClient initialization failed in development, falling back to mock store:',
        err?.message || err
      );
      return fallbackDb;
    }
  }

  console.warn(
    '[CRM Database] DATABASE_URL is missing in local development. Using in-memory fallback store.'
  );
  return fallbackDb;
}

export const db: PrismaClient = initializeDatabase() as unknown as PrismaClient;

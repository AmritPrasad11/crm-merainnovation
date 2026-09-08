import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { normalizeText } from '@/lib/utils';

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    const userCount = await db.user.count();
    if (process.env.NODE_ENV === 'production' && userCount > 0) {
      return NextResponse.json({ error: 'Database seeding is disabled in production as active accounts already exist.' }, { status: 403 });
    }

    // 1. Create or get Admin user
    let admin = await db.user.findUnique({
      where: { email: 'admin@merainnovation.com' },
    });

    if (!admin) {
      const passwordHash = await hashPassword('Admin@123456');
      admin = await db.user.create({
        data: {
          name: 'Mera Admin',
          email: 'admin@merainnovation.com',
          passwordHash,
          role: 'ADMIN',
        },
      });
    }

    // 2. Create or get Outreach User
    let outreachUser = await db.user.findUnique({
      where: { email: 'amrit@merainnovation.com' },
    });

    if (!outreachUser) {
      const passwordHash = await hashPassword('Outreach@123456');
      outreachUser = await db.user.create({
        data: {
          name: 'Amrit',
          email: 'amrit@merainnovation.com',
          passwordHash,
          role: 'OUTREACH_USER',
        },
      });
    }

    // Check if schools already exist
    const schoolCount = await db.school.count();
    if (schoolCount === 0) {
      // Seed sample schools
      const sampleSchools = [
        {
          name: 'St. Xavier Public School',
          normalizedName: normalizeText('St. Xavier Public School'),
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
          salesStage: 'INTERESTED' as const,
          leadScore: 65,
          assignedUserId: outreachUser.id,
          createdById: admin.id,
          lastContactedAt: new Date(Date.now() - 2 * 86400000),
          nextFollowUpAt: new Date(Date.now() + 86400000),
          notes: 'Interested in upgrading robotics curriculum for classes 6 to 10.',
          contacts: {
            create: [
              {
                name: 'Dr. R. K. Sharma',
                designation: 'Principal',
                email: 'principal@stxaviersjaipur.edu.in',
                phone: '+91 98290 12345',
                whatsapp: '+91 98290 12345',
                isPrimary: true,
              },
              {
                name: 'Sunita Verma',
                designation: 'STEM Coordinator',
                email: 'stem@stxaviersjaipur.edu.in',
                phone: '+91 98290 54321',
                whatsapp: '+91 98290 54321',
                isPrimary: false,
              },
            ],
          },
          activities: {
            create: [
              {
                userId: admin.id,
                type: 'SYSTEM' as const,
                title: 'School record created',
                description: 'Imported from initial outreach campaign list.',
              },
              {
                userId: outreachUser.id,
                type: 'CALL' as const,
                title: 'Initial phone call completed',
                description: 'Spoke with Dr. R. K. Sharma. Explained Mera Innovation STEM lab setup.',
              },
              {
                userId: outreachUser.id,
                type: 'STAGE_CHANGE' as const,
                title: 'Sales stage updated to INTERESTED',
                description: 'Principal requested proposal for 50-student robotics batch.',
              },
            ],
          },
          followUps: {
            create: [
              {
                assignedUserId: outreachUser.id,
                createdById: admin.id,
                title: 'Send customized Robotics Lab proposal & brochure',
                dueDate: new Date(Date.now() + 86400000),
                status: 'PENDING' as const,
              },
            ],
          },
        },
        {
          name: 'Delhi Public School',
          normalizedName: normalizeText('Delhi Public School'),
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
          salesStage: 'PROPOSAL_SENT' as const,
          leadScore: 85,
          assignedUserId: outreachUser.id,
          createdById: admin.id,
          lastContactedAt: new Date(Date.now() - 1 * 86400000),
          nextFollowUpAt: new Date(Date.now()), // Due Today
          notes: 'Proposal sent on 20th. Scheduled follow-up with Management Trustee.',
          contacts: {
            create: [
              {
                name: 'Anjali Gupta',
                designation: 'Director',
                email: 'director@dpsindore.org',
                phone: '+91 731 290 9999',
                whatsapp: '+91 731 290 9999',
                isPrimary: true,
              },
            ],
          },
          activities: {
            create: [
              {
                userId: admin.id,
                type: 'SYSTEM' as const,
                title: 'School record created',
                description: 'Direct website inquiry received.',
              },
              {
                userId: outreachUser.id,
                type: 'MEETING' as const,
                title: 'Virtual presentation meeting completed',
                description: 'Presented Mera Innovation curriculum & IoT kits.',
              },
              {
                userId: outreachUser.id,
                type: 'PROPOSAL' as const,
                title: 'Proposal v1.0 sent',
                description: 'Sent commercial proposal of INR 4.5 Lakhs.',
              },
            ],
          },
          followUps: {
            create: [
              {
                assignedUserId: outreachUser.id,
                createdById: admin.id,
                title: 'Follow up on proposal review with Director Anjali Gupta',
                dueDate: new Date(Date.now()), // Due Today
                status: 'PENDING' as const,
              },
            ],
          },
        },
        {
          name: 'DAV Public School',
          normalizedName: normalizeText('DAV Public School'),
          city: 'Chandigarh',
          state: 'Punjab',
          address: 'Sector 15-A',
          website: 'www.davchd.com',
          board: 'CBSE',
          schoolType: 'Trust / Foundation',
          studentStrength: 1900,
          hasStemLab: true,
          hasRoboticsLab: false,
          primaryEmail: 'principal@davchd.com',
          primaryPhone: '+91 172 274 0000',
          primaryWhatsapp: '+91 172 274 0000',
          source: 'Cold Outreach',
          salesStage: 'NOT_INTERESTED' as const,
          leadScore: 15,
          archived: true,
          archivedAt: new Date(Date.now() - 4 * 86400000),
          archivedById: admin.id,
          assignedUserId: outreachUser.id,
          createdById: admin.id,
          lastContactedAt: new Date(Date.now() - 6 * 86400000),
          notes: 'Archived record. School signed with an existing vendor for 2026-27.',
          contacts: {
            create: [
              {
                name: 'Vikramaditya Rao',
                designation: 'Robotics Coordinator',
                email: 'vikram@davchd.com',
                phone: '+91 172 274 0000',
                whatsapp: '+91 172 274 0000',
                isPrimary: true,
                archived: true,
              },
            ],
          },
          activities: {
            create: [
              {
                userId: admin.id,
                type: 'SYSTEM' as const,
                title: 'School record created and archived',
                description: 'Record archived after client declined STEM proposal.',
                archived: true,
              },
            ],
          },
        },
        {
          name: 'Modern Heritage Academy',
          normalizedName: normalizeText('Modern Heritage Academy'),
          city: 'Pune',
          state: 'Maharashtra',
          address: 'Kalyani Nagar',
          website: 'www.modernheritagepune.edu.in',
          board: 'IB',
          schoolType: 'Private',
          studentStrength: 1600,
          hasStemLab: false,
          hasRoboticsLab: false,
          primaryEmail: 'admin@mha-pune.edu.in',
          primaryPhone: '+91 20 2668 1234',
          primaryWhatsapp: '+91 20 2668 1234',
          source: 'Website Lead',
          salesStage: 'REJECTED' as const,
          leadScore: 20,
          archived: true,
          archivedAt: new Date(Date.now() - 2 * 86400000),
          archivedById: admin.id,
          assignedUserId: outreachUser.id,
          createdById: admin.id,
          lastContactedAt: new Date(Date.now() - 3 * 86400000),
          notes: 'Archived. School management postponed STEM lab implementation to next year.',
          contacts: {
            create: [
              {
                name: 'Sunita Deshmukh',
                designation: 'Vice Principal',
                email: 'sunita@mha-pune.edu.in',
                phone: '+91 20 2668 1234',
                whatsapp: '+91 20 2668 1234',
                isPrimary: true,
                archived: true,
              },
            ],
          },
          activities: {
            create: [
              {
                userId: admin.id,
                type: 'SYSTEM' as const,
                title: 'School record archived',
                description: 'Archived by Admin user.',
                archived: true,
              },
            ],
          },
        },
      ];

      for (const schoolData of sampleSchools) {
        await db.school.create({ data: schoolData });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database successfully seeded!',
      adminUser: {
        email: 'admin@merainnovation.com',
        password: 'Admin@123456',
      },
      outreachUser: {
        email: 'amrit@merainnovation.com',
        password: 'Outreach@123456',
      },
    });
  } catch (error) {
    console.error('Database seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

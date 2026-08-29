import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const search = searchParams.get('q') || '';
    const stage = searchParams.get('stage') || '';
    const board = searchParams.get('board') || '';

    const where: any = { archived: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (stage) where.salesStage = stage;
    if (board) where.board = board;

    const schools = await db.school.findMany({
      where,
      include: {
        assignedUser: { select: { name: true } },
        contacts: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { name: 'asc' },
    });

    if (format === 'json') {
      return NextResponse.json(schools);
    }

    // CSV Formatting
    const headers = [
      'School Name',
      'City',
      'State',
      'Address',
      'Website',
      'Board',
      'School Type',
      'Student Strength',
      'STEM Lab',
      'Robotics Lab',
      'Sales Stage',
      'Lead Score',
      'Primary Contact Name',
      'Contact Designation',
      'Contact Email',
      'Contact Phone',
      'Assigned User',
      'Created Date',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [
      headers.join(','),
      ...schools.map((s: any) => {
        const contact = s.contacts[0];
        return [
          escapeCsv(s.name),
          escapeCsv(s.city),
          escapeCsv(s.state),
          escapeCsv(s.address || ''),
          escapeCsv(s.website || ''),
          escapeCsv(s.board || ''),
          escapeCsv(s.schoolType || ''),
          escapeCsv(s.studentStrength || ''),
          escapeCsv(s.hasStemLab ? 'Yes' : 'No'),
          escapeCsv(s.hasRoboticsLab ? 'Yes' : 'No'),
          escapeCsv(s.salesStage),
          escapeCsv(s.leadScore),
          escapeCsv(contact?.name || ''),
          escapeCsv(contact?.designation || ''),
          escapeCsv(contact?.email || ''),
          escapeCsv(contact?.phone || ''),
          escapeCsv(s.assignedUser?.name || 'Unassigned'),
          escapeCsv(new Date(s.createdAt).toISOString().split('T')[0]),
        ].join(',');
      }),
    ];

    const csvContent = csvRows.join('\r\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Mera_Innovation_CRM_Schools_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

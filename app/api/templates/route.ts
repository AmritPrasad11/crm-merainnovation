import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const templates = await db.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, channel, subject, content, variables, metaTemplateId } = body;

    if (!name || !channel || !content) {
      return NextResponse.json({ error: 'Name, channel, and content are required.' }, { status: 400 });
    }

    const template = await db.template.create({
      data: {
        name,
        channel,
        subject: channel === 'EMAIL' ? subject || 'Outreach from Mera Innovation' : null,
        content,
        variables: variables || 'school_name,contact_name,city,assigned_user',
        metaTemplateId: channel === 'WHATSAPP' ? metaTemplateId || name.toLowerCase().replace(/[^a-z0-9]/g, '_') : null,
        metaStatus: channel === 'WHATSAPP' ? 'APPROVED' : null,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Create template API error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    await db.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}

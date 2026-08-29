import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mera_whatsapp_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta WhatsApp Webhook] Verified successfully!');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Meta WhatsApp Webhook Payload]:', JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Handle status updates (delivered, read, failed)
    const statuses = value?.statuses;
    if (statuses && statuses.length > 0) {
      for (const statusObj of statuses) {
        const metaMessageId = statusObj.id;
        const statusStr = statusObj.status; // delivered, read, failed

        let mappedStatus: 'DELIVERED' | 'READ' | 'FAILED' = 'DELIVERED';
        if (statusStr === 'read') mappedStatus = 'READ';
        if (statusStr === 'failed') mappedStatus = 'FAILED';

        // Update message log if present
        const logs = await db.messageLog.findMany({ where: { channel: 'WHATSAPP' } });
        const targetLog = logs.find((m: any) => m.externalId === metaMessageId);

        if (targetLog) {
          await db.messageLog.create({
            data: {
              schoolId: targetLog.schoolId,
              contactId: targetLog.contactId,
              campaignId: targetLog.campaignId,
              channel: 'WHATSAPP',
              direction: 'STATUS_UPDATE',
              sender: 'Meta Webhook',
              recipient: targetLog.recipient,
              content: `WhatsApp status updated to ${mappedStatus}`,
              status: mappedStatus,
              externalId: metaMessageId,
            },
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Meta WhatsApp Webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

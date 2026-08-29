export interface WhatsAppMessageOptions {
  to: string; // E.164 phone number e.g. "+91 98290 12345"
  templateName?: string;
  templateLanguage?: string;
  parameters?: string[]; // Param replacements for {{1}}, {{2}}
  textBody?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function cleanPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`; // default India country code if omitted
  return digits;
}

export async function sendWhatsAppMessage(options: WhatsAppMessageOptions): Promise<WhatsAppSendResult> {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const recipientPhone = cleanPhoneNumber(options.to);

  if (!apiKey || !phoneNumberId) {
    // Simulated Meta Cloud API Mode for local testing
    console.log(`[Meta WhatsApp Cloud API (Simulated)] Sending to +${recipientPhone}`);
    console.log(`Template: ${options.templateName || 'Direct Message'}`);
    console.log(`Parameters: ${JSON.stringify(options.parameters || [])}`);
    return {
      success: true,
      messageId: `wamid.SIMULATED_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    let payload: any;

    if (options.templateName) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'template',
        template: {
          name: options.templateName,
          language: { code: options.templateLanguage || 'en_US' },
          components: options.parameters?.length
            ? [
                {
                  type: 'body',
                  parameters: options.parameters.map((p) => ({
                    type: 'text',
                    text: p,
                  })),
                },
              ]
            : [],
        },
      };
    } else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: { preview_url: false, body: options.textBody || '' },
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Meta WhatsApp API delivery failed');
    }

    const messageId = data.messages?.[0]?.id;
    return { success: true, messageId };
  } catch (error: any) {
    console.error('Meta WhatsApp API error:', error);
    return { success: false, error: error.message || 'Meta WhatsApp API failed' };
  }
}

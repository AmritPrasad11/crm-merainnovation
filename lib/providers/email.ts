export interface EmailMessageOptions {
  to: string;
  subject: string;
  content: string;
  schoolName?: string;
  contactName?: string;
  cityName?: string;
  designation?: string;
  assignedUser?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function interpolateTemplateVariables(
  templateText: string,
  vars: {
    school_name?: string;
    contact_name?: string;
    city?: string;
    designation?: string;
    assigned_user?: string;
    [key: string]: string | undefined;
  }
): string {
  if (!templateText) return '';
  let interpolated = templateText;

  Object.entries(vars).forEach(([key, value]) => {
    const val = value || '';
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    interpolated = interpolated.replace(regex, val);
  });

  return interpolated;
}

export async function sendEmailMessage(options: EmailMessageOptions): Promise<EmailSendResult> {
  const apiKey = process.env.EMAIL_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'outreach@merainnovation.com';

  const finalContent = interpolateTemplateVariables(options.content, {
    school_name: options.schoolName,
    contact_name: options.contactName,
    city: options.cityName,
    designation: options.designation,
    assigned_user: options.assignedUser,
  });

  const finalSubject = interpolateTemplateVariables(options.subject, {
    school_name: options.schoolName,
    contact_name: options.contactName,
    city: options.cityName,
  });

  if (!apiKey) {
    // Development / Simulated mode
    console.log(`[Email Provider (Simulated)] Sending email to ${options.to}`);
    console.log(`Subject: ${finalSubject}`);
    console.log(`Body:\n${finalContent}`);
    return {
      success: true,
      messageId: `sim_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  try {
    // If API key is present (Resend / SMTP HTTP endpoint)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: finalSubject,
        text: finalContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Email API delivery error');
    }

    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error('Email Provider delivery error:', error);
    return { success: false, error: error.message || 'Failed to dispatch email' };
  }
}

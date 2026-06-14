
import { BrevoClient } from '@getbrevo/brevo';
import { env } from '~/config/environment.js';

const brevoClient = new BrevoClient({
  apiKey: env.BREVO_API_KEY
});

const sendEmail = async (toEmail, subject, text) => {
  try {
    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      sender: {
        email: env.ADMIN_EMAIL_ADDRESS,
        name: env.ADMIN_EMAIL_NAME
      },
      to: [
        {
          email: toEmail
        }
      ],
      subject,
      textContent: text
    });

    return response;
  } catch (error) {
    console.error('Brevo send email error:', error?.body || error?.response?.body || error);
    throw error;
  }
};

export const BrevoProvider = {
  sendEmail
};
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.SENDGRID_API_KEY;
const defaultFrom = process.env.EMAIL_FROM;
const defaultReplyTo = process.env.EMAIL_REPLY_TO || defaultFrom;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not set');
  }
  if (!defaultFrom) {
    throw new Error('EMAIL_FROM is not set');
  }

  const msg = {
    to,
    from: defaultFrom,
    replyTo: replyTo || defaultReplyTo,
    subject,
    text,
    html,
  };

  await sgMail.send(msg);
};

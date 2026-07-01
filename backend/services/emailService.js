import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using environment credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io', // default to mailtrap for testing
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  connectionTimeout: 5000, // 5 seconds connection timeout
  greetingTimeout: 5000,   // 5 seconds greeting timeout
  socketTimeout: 5000,     // 5 seconds socket timeout
});

/**
 * Send an email notification (fallback to console log if transporter is unconfigured)
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`\n--- MOCK EMAIL SENT ---`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Text: ${text}`);
      console.log(`-------------------------\n`);
      return { success: true, mock: true };
    }

    const info = await transporter.sendMail({
      from: '"Mediclink HMS" <no-reply@mediclink.com>',
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email sending failed: ${error.message}`);
    // Log message as fallback so we don't break the application flow
    console.log(`\n--- FALLBACK MOCK EMAIL (due to error) ---`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log(`------------------------------------------\n`);
    return { success: false, error: error.message };
  }
};

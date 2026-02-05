import nodemailer from 'nodemailer';
import path from 'path';

(async () => {
  try {
    // Create a test account (Ethereal) so we don't need real SMTP creds
    const testAccount = await nodemailer.createTestAccount();

    // Set env vars so the app's createTransporter will pick them up
    process.env.EMAIL_HOST = testAccount.smtp.host;
    process.env.EMAIL_PORT = String(testAccount.smtp.port);
    process.env.EMAIL_USER = testAccount.user;
    process.env.EMAIL_PASSWORD = testAccount.pass;
    process.env.EMAIL_SECURE = String(testAccount.smtp.secure || false);
    process.env.EMAIL_FROM_NAME = 'Codora AI (Test)';
    process.env.TEAM_PORTAL_URL = 'https://example.com/team';

    // Import app helpers after env is set
    const { createTransporter } = await import('../src/config/email.config.js');
    const { getWelcomeEmailTemplate } = await import('../src/utils/emailTemplates.js');

    const transporter = createTransporter();

    // Build mail
    const mailOptions = {
      from: { name: process.env.EMAIL_FROM_NAME, address: process.env.EMAIL_USER },
      to: 'recipient@example.com',
      subject: 'Test Welcome Email - Codora AI (Ethereal)',
      html: getWelcomeEmailTemplate('TestTeam', 'recipient@example.com', 'TestPass123', process.env.TEAM_PORTAL_URL),
      text: `Hello Team TestTeam,\n\nThis is a test welcome email. Password: TestPass123\n\nTeam portal: ${process.env.TEAM_PORTAL_URL}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent. messageId=', info.messageId);

    // If using Ethereal, print preview URL
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('Preview URL:', preview);
    } else {
      console.log('No preview URL available for this transport.');
    }

    // Verify transporter (optional)
    try {
      await transporter.verify();
      console.log('Transporter verified OK');
    } catch (vErr) {
      console.warn('Transporter verify failed:', vErr.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('Test send failed:', err);
    process.exit(1);
  }
})();

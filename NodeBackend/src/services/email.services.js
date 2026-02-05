import { createTransporter } from "../config/email.config.js";
import { getWelcomeEmailTemplate } from "../utils/emailTemplates.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendWelcomeEmail = async (teamName, email, password) => {
  try {
    const transporter = createTransporter();
    const teamPortalUrl =
      process.env.TEAM_PORTAL_URL;

    const logoPath = path.join(__dirname, "../../images/codoraai.png");

    const mailOptions = {
      from: {
        name: "Codora AI Hackathon",
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: `🎉 Welcome to Codora AI Hackathon - Team ${teamName}`,
      html: getWelcomeEmailTemplate(teamName, email, password, teamPortalUrl),
    };

    // ✅ Only attach logo if file exists
    if (fs.existsSync(logoPath)) {
      mailOptions.attachments = [
        {
          filename: "codoraai.png",
          path: logoPath,
          cid: "codoraLogo",
        },
      ];
    } else {
      console.warn("Logo file not found at:", logoPath);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

export const sendBulkWelcomeEmails = async (teams) => {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (const team of teams) {
    try {
      await sendWelcomeEmail(team.teamName, team.email, team.password);
      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        team: team.teamName,
        email: team.email,
        error: error.message,
      });
    }
  }

  return results;
};

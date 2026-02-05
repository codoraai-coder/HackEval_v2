export const getWelcomeEmailTemplate = (
  teamName,
  email,
  password,
  teamPortalUrl,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Codora AI Hackathon</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7fa;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .header p {
            color: #e0e7ff;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .message {
            color: #4b5563;
            line-height: 1.8;
            margin-bottom: 30px;
            font-size: 15px;
        }
        .credentials-box {
            background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
            border-left: 4px solid #667eea;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .credentials-box h3 {
            color: #667eea;
            font-size: 18px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .credentials-box h3:before {
            content: "🔐";
            margin-right: 10px;
            font-size: 22px;
        }
        .credential-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #cbd5e1;
        }
        .credential-item:last-child {
            border-bottom: none;
        }
        .credential-label {
            color: #6b7280;
            font-weight: 600;
            font-size: 14px;
        }
        .credential-value {
            color: #1f2937;
            font-family: 'Courier New', monospace;
            background: #ffffff;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .important-notes {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .important-notes h4 {
            color: #d97706;
            font-size: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        .important-notes h4:before {
            content: "⚠️";
            margin-right: 10px;
            font-size: 20px;
        }
        .important-notes ul {
            margin-left: 20px;
            color: #92400e;
        }
        .important-notes li {
            margin: 8px 0;
            line-height: 1.6;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 25px 0;
        }
        .feature-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }
        .feature-text {
            color: #4b5563;
            font-size: 13px;
            font-weight: 500;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 25px 20px;
            }
            .features {
                grid-template-columns: 1fr;
            }
            .credential-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .credential-value {
                margin-top: 8px;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <!-- ✅ Add onerror handler for missing logo -->
            <img
                src="cid:codoraLogo"
                alt="Codora AI Logo"
                class="logo"
                onerror="this.style.display='none'"
            />
            <h1>Welcome to Codora AI Hackathon! 🚀</h1>
            <p>Your journey to innovation starts here</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello, Team ${teamName}! 👋
            </div>

            <div class="message">
                Congratulations! Your team has been successfully registered for the <strong>Codora AI Hackathon</strong>.
                We're thrilled to have you on board and can't wait to see the innovative solutions you'll create!
            </div>

            <!-- Credentials Box -->
            <div class="credentials-box">
                <h3>Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Email Address:</span>
                    <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="${teamPortalUrl}" class="cta-button">
                    🎯 Access Team Portal
                </a>
            </div>

            <!-- Features -->
            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">Track Progress</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">Manage Team</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📤</div>
                    <div class="feature-text">Submit Projects</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🏆</div>
                    <div class="feature-text">View Leaderboard</div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Important Notes -->
            <div class="important-notes">
                <h4>Important Security Notes</h4>
                <ul>
                    <li><strong>Change your password immediately</strong> after your first login for security purposes.</li>
                    <li>Keep your login credentials confidential and don't share them with anyone outside your team.</li>
                    <li>Use the team portal to manage members, submit deliverables, and track your progress.</li>
                    <li>Check your email regularly for important updates and announcements.</li>
                </ul>
            </div>

            <div class="message">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
                We're here to help you succeed!
                <br><br>
                <strong>Good luck, and may the best innovation win! 💡</strong>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="font-weight: 600; color: #1f2937; margin-bottom: 10px;">Codora AI Hackathon Team</p>
            <div class="social-links">
                <a href="#">Website</a> •
                <a href="#">LinkedIn</a> •
                <a href="#">Twitter</a> •
                <a href="#">Support</a>
            </div>
            <p>© ${new Date().getFullYear()} Codora AI. All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 11px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

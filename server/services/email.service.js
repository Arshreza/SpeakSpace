import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  }
  return transporter;
};

const FROM = process.env.EMAIL_FROM || 'SpeckSpace <noreply@speckspace.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const baseStyles = `
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f1a; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(99, 102, 241, 0.2); }
  .logo { text-align: center; margin-bottom: 32px; }
  .logo-text { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo-dot { color: #6366f1; }
  h1 { color: #f8fafc; font-size: 24px; font-weight: 700; margin: 0 0 16px; text-align: center; }
  p { color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; margin: 24px 0; }
  .btn-container { text-align: center; }
  .divider { border: none; border-top: 1px solid rgba(99, 102, 241, 0.2); margin: 24px 0; }
  .footer { text-align: center; margin-top: 32px; color: #475569; font-size: 14px; }
  .warning { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px 16px; color: #fca5a5; font-size: 14px; margin: 16px 0; }
  .info-box { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
  .score-badge { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; font-size: 36px; font-weight: 800; padding: 16px 32px; border-radius: 12px; margin: 16px 0; }
`;

const sendEmail = async (options) => {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html?.replace(/<[^>]+>/g, '') || '',
    });
    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed to ${options.to}: ${error.message}`);
    throw error;
  }
};

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${CLIENT_URL}/verify-email/${token}`;
  const html = `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo"><span class="logo-text">Speck<span class="logo-dot">Space</span></span></div>
      <h1>Verify Your Email Address</h1>
      <p>Hi ${name},</p>
      <p>Welcome to SpeckSpace! We're excited to have you on board. To complete your registration and start your interview preparation journey, please verify your email address.</p>
      <div class="btn-container">
        <a href="${verifyUrl}" class="btn">✉️ Verify Email Address</a>
      </div>
      <p style="text-align:center; color: #64748b; font-size: 14px;">This link expires in 24 hours.</p>
      <hr class="divider">
      <p style="font-size: 13px; color: #475569;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="font-size: 13px; word-break: break-all; color: #6366f1;">${verifyUrl}</p>
      <div class="warning">If you didn't create a SpeckSpace account, please ignore this email or contact support if you have concerns.</div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SpeckSpace. All rights reserved.</p>
      <p>Helping you ace every interview 🚀</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: '✉️ Verify your SpeckSpace email address',
    html,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${token}`;
  const html = `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo"><span class="logo-text">Speck<span class="logo-dot">Space</span></span></div>
      <h1>🔐 Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your SpeckSpace account. Click the button below to set a new password.</p>
      <div class="btn-container">
        <a href="${resetUrl}" class="btn">🔑 Reset Password</a>
      </div>
      <p style="text-align:center; color: #64748b; font-size: 14px;">This link expires in 1 hour.</p>
      <hr class="divider">
      <div class="warning">⚠️ If you didn't request a password reset, please ignore this email. Your password will remain unchanged. If you believe your account is at risk, contact our support team immediately.</div>
      <p style="font-size: 13px; color: #475569;">Or copy and paste this URL:</p>
      <p style="font-size: 13px; word-break: break-all; color: #6366f1;">${resetUrl}</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SpeckSpace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: '🔐 Password reset request — SpeckSpace',
    html,
  });
};

const sendWelcomeEmail = async (email, name) => {
  const html = `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo"><span class="logo-text">Speck<span class="logo-dot">Space</span></span></div>
      <h1>🎉 Welcome to SpeckSpace!</h1>
      <p>Hi ${name},</p>
      <p>You're officially part of the SpeckSpace community — the platform where ambitious developers ace their interviews and land their dream jobs!</p>
      <div class="info-box">
        <p style="margin:0; color: #e2e8f0; font-weight: 600;">Here's what you can do now:</p>
        <ul style="color: #94a3b8; margin: 8px 0; padding-left: 20px;">
          <li>🎤 Start AI-powered mock interviews</li>
          <li>📄 Upload and analyze your resume for ATS optimization</li>
          <li>🤖 Chat with your personal AI career coach</li>
          <li>🗺️ Get a personalized 30/60/90 day roadmap</li>
          <li>🏆 Compete on the leaderboard</li>
        </ul>
      </div>
      <div class="btn-container">
        <a href="${CLIENT_URL}/dashboard" class="btn">🚀 Go to Dashboard</a>
      </div>
      <p style="text-align: center; color: #64748b; font-size: 14px;">Your interview preparation journey starts now.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SpeckSpace. All rights reserved.</p>
      <p>Helping you ace every interview 🚀</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: '🎉 Welcome to SpeckSpace — Your Interview Journey Begins!',
    html,
  });
};

const sendInterviewCompletedEmail = async (email, name, score) => {
  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const scoreMessage =
    score >= 75
      ? 'Excellent work! You are interview-ready! 🎯'
      : score >= 50
      ? 'Good progress! Keep practicing to improve your score.'
      : 'Keep practicing — consistency is key to improvement! 💪';

  const html = `
<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo"><span class="logo-text">Speck<span class="logo-dot">Space</span></span></div>
      <h1>📊 Interview Complete!</h1>
      <p>Hi ${name},</p>
      <p>You've completed your mock interview session on SpeckSpace. Here's how you did:</p>
      <div style="text-align: center; margin: 24px 0;">
        <div class="score-badge" style="background: ${scoreColor};">${score}%</div>
        <p style="color: #e2e8f0; font-weight: 600; font-size: 18px;">${scoreMessage}</p>
      </div>
      <div class="info-box">
        <p style="margin: 0; color: #e2e8f0;">📋 Your detailed report includes:</p>
        <ul style="color: #94a3b8; margin: 8px 0; padding-left: 20px;">
          <li>Technical, communication, and confidence scores</li>
          <li>Strengths and areas for improvement</li>
          <li>AI-powered suggestions for each answer</li>
          <li>Personalized next steps</li>
        </ul>
      </div>
      <div class="btn-container">
        <a href="${CLIENT_URL}/interviews" class="btn">📊 View Full Report</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SpeckSpace. All rights reserved.</p>
      <p>Keep practicing to ace your next interview! 🚀</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to: email,
    subject: `📊 Interview Results: You scored ${score}% — SpeckSpace`,
    html,
  });
};

export {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendInterviewCompletedEmail,
};

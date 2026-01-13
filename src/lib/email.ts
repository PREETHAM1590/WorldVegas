import nodemailer from 'nodemailer';

// Email configuration from environment
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || 'WorldVegas <noreply@worldvegas.com>';

// Create transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// Email templates
const templates = {
  welcomeEmail: (username: string) => ({
    subject: 'Welcome to WorldVegas! 🎰',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #a855f7; }
          .content { line-height: 1.6; }
          .button { display: inline-block; background: #a855f7; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎰 WorldVegas</div>
          </div>
          <div class="content">
            <h2>Welcome, ${username}!</h2>
            <p>Thank you for joining WorldVegas - the premier crypto casino on World Chain.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>🎮 Play 7+ exciting games</li>
              <li>💰 Deposit WLD or USDC</li>
              <li>🏆 Climb the leaderboards</li>
              <li>🎁 Claim exclusive bonuses</li>
            </ul>
            <p>Ready to start winning?</p>
            <a href="https://worldvegas.app/games" class="button">Play Now</a>
          </div>
          <div class="footer">
            <p>Please gamble responsibly. Must be 18+ to play.</p>
            <p>© 2024 WorldVegas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to WorldVegas, ${username}! Thank you for joining. Visit https://worldvegas.app/games to start playing.`,
  }),

  depositConfirmation: (amount: number, currency: string, txHash: string) => ({
    subject: `Deposit Confirmed: ${amount} ${currency} 💰`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #a855f7; }
          .amount { font-size: 36px; font-weight: bold; color: #22c55e; text-align: center; margin: 20px 0; }
          .details { background: #0f172a; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎰 WorldVegas</div>
          </div>
          <div class="content">
            <h2>Deposit Confirmed! ✅</h2>
            <div class="amount">+${amount} ${currency}</div>
            <div class="details">
              <div class="detail-row">
                <span>Amount:</span>
                <span>${amount} ${currency}</span>
              </div>
              <div class="detail-row">
                <span>Status:</span>
                <span style="color: #22c55e;">Completed</span>
              </div>
              <div class="detail-row">
                <span>Transaction:</span>
                <span>${txHash.slice(0, 10)}...${txHash.slice(-8)}</span>
              </div>
            </div>
            <p>Your balance has been credited. Good luck! 🍀</p>
          </div>
          <div class="footer">
            <p>© 2024 WorldVegas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your deposit of ${amount} ${currency} has been confirmed. Transaction: ${txHash}`,
  }),

  withdrawalProcessed: (amount: number, currency: string, status: 'completed' | 'rejected', txHash?: string) => ({
    subject: status === 'completed'
      ? `Withdrawal Completed: ${amount} ${currency} 💸`
      : `Withdrawal Update: ${amount} ${currency}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #a855f7; }
          .amount { font-size: 36px; font-weight: bold; color: ${status === 'completed' ? '#22c55e' : '#ef4444'}; text-align: center; margin: 20px 0; }
          .details { background: #0f172a; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎰 WorldVegas</div>
          </div>
          <div class="content">
            <h2>Withdrawal ${status === 'completed' ? 'Completed' : 'Rejected'}</h2>
            <div class="amount">${status === 'completed' ? '-' : ''}${amount} ${currency}</div>
            <div class="details">
              <p><strong>Status:</strong> <span style="color: ${status === 'completed' ? '#22c55e' : '#ef4444'};">${status === 'completed' ? 'Completed' : 'Rejected'}</span></p>
              ${txHash ? `<p><strong>Transaction:</strong> ${txHash.slice(0, 10)}...${txHash.slice(-8)}</p>` : ''}
            </div>
            ${status === 'rejected' ? '<p>If you have questions, please contact support.</p>' : '<p>Your funds have been sent to your wallet.</p>'}
          </div>
          <div class="footer">
            <p>© 2024 WorldVegas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your withdrawal of ${amount} ${currency} has been ${status}.${txHash ? ` Transaction: ${txHash}` : ''}`,
  }),

  bigWinNotification: (game: string, amount: number, currency: string, multiplier: number) => ({
    subject: `Congratulations! You won ${amount} ${currency}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%); border-radius: 16px; padding: 30px; border: 2px solid #a855f7; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #a855f7; }
          .win-amount { font-size: 48px; font-weight: bold; background: linear-gradient(135deg, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; margin: 20px 0; }
          .multiplier { font-size: 24px; color: #22c55e; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎰 WorldVegas</div>
          </div>
          <div class="content" style="text-align: center;">
            <h1>🎉 BIG WIN! 🎉</h1>
            <p>You hit a massive win on <strong>${game}</strong>!</p>
            <div class="win-amount">${amount} ${currency}</div>
            <div class="multiplier">${multiplier}x Multiplier!</div>
            <p style="margin-top: 30px;">Keep the streak going! 🔥</p>
          </div>
          <div class="footer">
            <p>© 2024 WorldVegas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Congratulations! You won ${amount} ${currency} on ${game} with a ${multiplier}x multiplier!`,
  }),

  accountLocked: (reason: string) => ({
    subject: 'Account Security Notice',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #a855f7; }
          .alert { background: #7f1d1d; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎰 WorldVegas</div>
          </div>
          <div class="content">
            <h2>Account Security Notice</h2>
            <div class="alert">
              <p><strong>Your account has been locked.</strong></p>
              <p>Reason: ${reason}</p>
            </div>
            <p>If you believe this is an error, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 WorldVegas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your WorldVegas account has been locked. Reason: ${reason}. Contact support if you believe this is an error.`,
  }),

  selfExclusionConfirmation: (endDate: Date) => ({
    subject: 'Self-Exclusion Confirmed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #1a1a2e; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #a855f7; }
          .info { background: #0f172a; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎰 WorldVegas</div>
          </div>
          <div class="content">
            <h2>Self-Exclusion Confirmed</h2>
            <p>We've received your self-exclusion request. Your account will be restricted until:</p>
            <div class="info">
              <p style="font-size: 24px; text-align: center; font-weight: bold;">${endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <p>During this period, you won't be able to:</p>
            <ul>
              <li>Play any games</li>
              <li>Make deposits</li>
              <li>Access your account</li>
            </ul>
            <p>If you need support, please contact:</p>
            <ul>
              <li>Gambling Helpline: 1-800-522-4700</li>
              <li>BeGambleAware: begambleaware.org</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 WorldVegas. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your self-exclusion has been confirmed. Your account will be restricted until ${endDate.toLocaleDateString()}.`,
  }),
};

// Email sending functions
export async function sendEmail(to: string, template: { subject: string; html: string; text: string }) {
  const transport = getTransporter();

  if (!transport) {
    console.log('Email not configured, skipping:', template.subject);
    return { success: false, error: 'Email not configured' };
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    console.log('Email sent successfully:', template.subject, 'to', to);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: String(error) };
  }
}

// Convenience functions
export const emailService = {
  sendWelcomeEmail: (to: string, username: string) =>
    sendEmail(to, templates.welcomeEmail(username)),

  sendDepositConfirmation: (to: string, amount: number, currency: string, txHash: string) =>
    sendEmail(to, templates.depositConfirmation(amount, currency, txHash)),

  sendWithdrawalProcessed: (to: string, amount: number, currency: string, status: 'completed' | 'rejected', txHash?: string) =>
    sendEmail(to, templates.withdrawalProcessed(amount, currency, status, txHash)),

  sendBigWinNotification: (to: string, game: string, amount: number, currency: string, multiplier: number) =>
    sendEmail(to, templates.bigWinNotification(game, amount, currency, multiplier)),

  sendAccountLocked: (to: string, reason: string) =>
    sendEmail(to, templates.accountLocked(reason)),

  sendSelfExclusionConfirmation: (to: string, endDate: Date) =>
    sendEmail(to, templates.selfExclusionConfirmation(endDate)),
};

export default emailService;

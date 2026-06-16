import sendEmail from '../utils/sendEmail.js';

const sendRegisterEmail = async (email, name, link) => {
    const appName = process.env.APP_NAME || 'Our Service';
    const teamName = process.env.TEAM_NAME || `${appName} Team`;
    const frontendUrl = link || process.env.FRONTEND_URL || '#';

    const subject = `Welcome to ${appName}, ${name}!`;

    const text = `Hi ${name},\n\nWelcome to ${appName}! Get started here: ${frontendUrl}\n\nIf you have questions, reply to this email.\n\nThanks,\n${teamName}`;

    const html = `<!doctype html>
    <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <style>
                .container { max-width:600px; margin:0 auto; font-family:Arial,Helvetica,sans-serif; color:#333; }
                .card { background:#fff; padding:24px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
                .header { text-align:center; margin-bottom:16px; }
                .button { display:inline-block; padding:12px 20px; background:#2563eb; color:#fff; border-radius:6px; text-decoration:none; }
                .footer { font-size:12px; color:#777; margin-top:18px; text-align:center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h2>Welcome to ${appName}, ${name}!</h2>
                    </div>
                    <p>Hi ${name},</p>
                    <p>Thanks for creating an account with ${appName}. We're excited to have you on board.</p>
                    <p style="text-align:center; margin:24px 0;"><a class="button" href="${frontendUrl}">Get Started</a></p>
                    <p>If you need help, just reply to this email and our team will assist you.</p>
                    <p>Cheers,<br/>${teamName}</p>
                </div>
                <div class="footer">© ${new Date().getFullYear()} ${appName}. If you didn't sign up, please ignore this email.</div>
            </div>
        </body>
    </html>`;

    await sendEmail(email, subject, text, html);
};

export default sendRegisterEmail;
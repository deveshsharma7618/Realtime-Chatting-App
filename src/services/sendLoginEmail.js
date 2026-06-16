import sendEmail from '../utils/sendEmail.js';


const getDeviceName = (userAgent = '') => {
    const normalizedUserAgent = userAgent.toLowerCase();

    if (!normalizedUserAgent) {
        return 'Unknown device';
    }

    if (normalizedUserAgent.includes('iphone')) return 'iPhone';
    if (normalizedUserAgent.includes('ipad')) return 'iPad';
    if (normalizedUserAgent.includes('android')) return 'Android device';
    if (normalizedUserAgent.includes('windows')) return 'Windows device';
    if (normalizedUserAgent.includes('macintosh')) return 'Mac device';
    if (normalizedUserAgent.includes('linux')) return 'Linux device';

    return userAgent;
};

const sendLoginEmail = async (email, name, { ipAddress, userAgent, loginAt } = {}) => {
    const appName = process.env.APP_NAME || 'Our Service';
    const teamName = process.env.TEAM_NAME || `${appName} Team`;
    const deviceName = getDeviceName(userAgent);
    const loginDateTime = loginAt ? new Date(loginAt) : new Date();
    const formattedLoginDateTime = loginDateTime.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
    });

    const subject = `New login to ${appName}`;

    const text = `Hi ${name},\n\nWe detected a successful login to your ${appName} account.\n\nDevice: ${deviceName}\nIP Address: ${ipAddress || 'Unknown'}\nDate and Time: ${formattedLoginDateTime}\n\nIf this was not you, please secure your account immediately.\n\nThanks,\n${teamName}`;

    const html = `<!doctype html>
    <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <style>
                .container { max-width:600px; margin:0 auto; font-family:Arial,Helvetica,sans-serif; color:#333; background:#f8fafc; padding:24px; }
                .card { background:#fff; padding:24px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
                .header { text-align:center; margin-bottom:16px; }
                .details { width:100%; border-collapse:collapse; margin:20px 0; }
                .details td { padding:10px 0; border-bottom:1px solid #e5e7eb; vertical-align:top; }
                .details td:first-child { font-weight:600; width:140px; color:#111827; }
                .alert { color:#b45309; background:#fffbeb; border:1px solid #fcd34d; padding:12px 14px; border-radius:8px; margin-top:18px; }
                .footer { font-size:12px; color:#777; margin-top:18px; text-align:center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">
                        <h2>New login detected</h2>
                    </div>
                    <p>Hi ${name},</p>
                    <p>We detected a successful sign-in to your ${appName} account.</p>
                    <table class="details" role="presentation">
                        <tr>
                            <td>Device</td>
                            <td>${deviceName}</td>
                        </tr>
                        <tr>
                            <td>IP Address</td>
                            <td>${ipAddress || 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td>Date and Time</td>
                            <td>${formattedLoginDateTime}</td>
                        </tr>
                    </table>
                    <div class="alert">If this was not you, please change your password and secure your account immediately.</div>
                    <p>Thanks,<br/>${teamName}</p>
                </div>
                <div class="footer">© ${new Date().getFullYear()} ${appName}</div>
            </div>
        </body>
    </html>`;

    await sendEmail(email, subject, text, html);
};

export default sendLoginEmail;
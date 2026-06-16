import sendEmail from '../utils/sendEmail.js';

const sendOtpEmail = async (email, name, link) => {
    const appName = process.env.APP_NAME || 'Our Service';
    const teamName = process.env.TEAM_NAME || `${appName} Team`;
    const frontendUrl = link || process.env.FRONTEND_URL || '#';
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    const purpose = 'account verification'; // You can customize this based on the context
    const subject = `Welcome to ${appName}, ${name}!`;

    const text = `Hi ${name},\n\nWelcome to ${appName}! Get started here: ${frontendUrl}\n\nIf you have questions, reply to this email.\n\nThanks,\n${teamName}`;

    const html = `<!doctype html>   
    <html>    
         <head>       
         <meta charset="utf-8" />       
         <meta name="viewport" content="width=device-width,initial-scale=1" />       
         <style>         
         .container { max-width:600px; margin:0 auto; font-family:Arial,Helvetica,sans-serif; color:#333; background:#f6f7fb; padding:24px; }         
         .card { background:#fff; padding:24px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.08); }         
         .header { text-align:center; margin-bottom:16px; }         
         .otp-box { text-align:center; font-size:32px; font-weight:bold; letter-spacing:6px; padding:16px; background:#eef2ff; border-radius:8px; margin:24px 0; color:#1d4ed8; }         
         .footer { font-size:12px; color:#777; margin-top:18px; text-align:center; }       </style>     </head>     <body>       <div class="container">         <div class="card">           <div class="header">             <h2>${appName} OTP Code</h2>           </div>           <p>Hi ${name},</p>           <p>You requested a one-time password for ${purpose}.</p>          
          <div class="otp-box">${otp}</div>           
          <p>This code will expire in 10 minutes.</p>           
          <p>If you did not request this, you can safely ignore this email.</p>           
          <p>Thanks,<br />${teamName}</p>         
          </div>         
          <div class="footer">© ${new Date().getFullYear()} ${appName}</div>       </div>     
          </body>   
          </html>`;

    await sendEmail(email, subject, text, html);

    return otp; // Return the generated OTP for further processing (e.g., storing in DB)
};

export default sendOtpEmail;
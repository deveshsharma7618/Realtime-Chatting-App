import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

export const sendEmail = async (to, subject, textContent, htmlContent) => {
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to,
    subject,
    text: textContent,
    html: htmlContent || textContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  }
  catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;


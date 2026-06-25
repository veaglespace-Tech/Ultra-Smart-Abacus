import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email is not configured. Set EMAIL_USER and EMAIL_PASS in Server/.env."
    );
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Real SMTP email sent successfully to ${to}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email via SMTP: ${err.message}`);
    throw new Error(
      "Failed to send OTP email. Check EMAIL_USER and EMAIL_PASS in Server/.env."
    );
  }
};

export default sendEmail;

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

 try {
  await transporter.sendMail({
    from: `"Ultra Smart Abacus" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px">
        <h2 style="color:#2563eb;">Ultra Smart Abacus</h2>

        <p>Hello,</p>

        <p>You requested to reset your password.</p>

        <p>Your OTP is:</p>

        <h1 style="
          background:#2563eb;
          color:white;
          padding:15px;
          display:inline-block;
          border-radius:8px;
          letter-spacing:5px;
        ">
          ${text}
        </h1>

        <p>This OTP will expire in <b>5 minutes</b>.</p>

        <p>If you didn't request this password reset, you can safely ignore this email.</p>

        <hr>

        <small>Ultra Smart Abacus Team</small>
      </div>
    `,
  });

  console.log(`[EMAIL SUCCESS] Email sent successfully to ${to}`);
} catch (err) {
  console.error(`[EMAIL ERROR] ${err.message}`);

  throw new Error(
    "Failed to send OTP email. Check EMAIL_USER and EMAIL_PASS in Server/.env."
  );
}
};

export default sendEmail;



const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, name, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Your StockSense Pro Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #0f0f0f; color: #ffffff; border-radius: 12px;">
        <h2 style="color: #a855f7;">StockSense Pro</h2>
        <p style="color: #9ca3af;">Hi ${name},</p>
        <p style="color: #9ca3af;">Your verification code is:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #a855f7;">
            ${otp}
          </span>
        </div>
        <p style="color: #9ca3af;">This code expires in <strong style="color: #ffffff;">10 minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
          If you didn't create a StockSense Pro account, ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
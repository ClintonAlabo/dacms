const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(to, code) {
  try {
    const info = await transporter.sendMail({
      from: `"DACMS Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your DACMS Verification Code',
      text: `Your DACMS verification code is: ${code}`,
      html: `
        <div style="font-family:Arial,sans-serif;font-size:16px;color:#333;">
          <h3>DACMS Verification</h3>
          <p>Your one-time verification code is:</p>
          <p style="font-size:20px;font-weight:bold;color:#007BFF;">${code}</p>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    });
    console.log('✅ OTP email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Failed to send OTP email:', err.message);
    return null;
  }
}

module.exports = { sendOTPEmail };

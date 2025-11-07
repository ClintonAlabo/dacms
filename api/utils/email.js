const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOTPEmail(to, code){
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your DACMS verification code',
    text: `Your DACMS verification code is: ${code}`,
    html: `<p>Your DACMS verification code is: <strong>${code}</strong></p>`
  });
  return info;
}

module.exports = { sendOTPEmail };

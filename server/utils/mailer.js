const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Repair Connect" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your Repair Connect Login Code',
    html: `
      <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; border: 1px solid #292929; border-radius: 12px; padding: 40px; color: #f5f5f5;">
        <h1 style="color: #f59e0b; margin-bottom: 8px; font-size: 24px;">Repair Connect</h1>
        <p style="color: #a3a3a3; margin-bottom: 32px;">Your trusted repair partner</p>
        <p style="font-size: 16px; margin-bottom: 24px;">Your login verification code is:</p>
        <div style="background: #111111; border: 1px solid #292929; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f59e0b;">${otp}</span>
        </div>
        <p style="color: #a3a3a3; font-size: 14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };

import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { EmailOptions } from '../types';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: `"Mussikon" <${config.email.user}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name: string, role: string): Promise<void> => {
  const subject = 'Welcome to Mussikon!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0A2A5F;">Welcome to Mussikon, ${name}!</h2>
      <p>Thank you for joining our community of ${role === 'musician' ? 'musicians' : 'church leaders'}.</p>
      <p>Your account is ${role === 'leader' ? 'active and ready to use' : 'pending approval from our administrators'}.</p>
      <p>We're excited to help you connect with the ${role === 'musician' ? 'perfect opportunities' : 'perfect musicians'} for your needs.</p>
      <p>Best regards,<br>The Mussikon Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

export const sendValidationEmail = async (email: string, name: string, status: string): Promise<void> => {
  const subject = `Account ${status === 'approved' ? 'Approved' : 'Status Update'} - Mussikon`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0A2A5F;">Account ${status === 'approved' ? 'Approved' : 'Status Update'}</h2>
      <p>Hello ${name},</p>
      <p>Your account has been ${status === 'approved' ? 'approved and is now active' : status}.</p>
      ${status === 'approved' ? '<p>You can now start using Mussikon to find opportunities and connect with others.</p>' : ''}
      <p>Best regards,<br>The Mussikon Team</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

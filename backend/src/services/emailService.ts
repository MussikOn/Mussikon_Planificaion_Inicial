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

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string): Promise<void> => {
  const resetUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const subject = 'Recuperar Contraseña - Mussikon';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Recuperar Contraseña</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Mussikon - Plataforma Musical</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A2A5F; margin-top: 0;">¡Hola ${name}!</h2>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en Mussikon. 
          Si no solicitaste este cambio, puedes ignorar este correo.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold; 
                    display: inline-block;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            🔑 Restablecer Contraseña
          </a>
        </div>
        
        <div style="background: #e6f3ff; border-left: 4px solid #0A2A5F; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #0A2A5F; font-weight: bold;">⚠️ Importante:</p>
          <ul style="margin: 10px 0 0 0; color: #4a5568; padding-left: 20px;">
            <li>Este enlace expirará en 1 hora por seguridad</li>
            <li>Solo puedes usar este enlace una vez</li>
            <li>Si no funciona, solicita un nuevo enlace</li>
          </ul>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin-top: 30px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
          <a href="${resetUrl}" style="color: #0A2A5F; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #718096; font-size: 14px; margin: 0;">
          Este correo fue enviado desde Mussikon. Si tienes alguna pregunta, 
          contáctanos en <a href="mailto:support@mussikon.com" style="color: #0A2A5F;">support@mussikon.com</a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

export const sendEmailVerificationEmail = async (email: string, name: string, verificationCode: string): Promise<void> => {
  const subject = 'Código de Verificación - Mussikon';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Código de Verificación</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Mussikon - Plataforma Musical</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0A2A5F; margin-top: 0;">¡Hola ${name}!</h2>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
          Gracias por registrarte en Mussikon. Para completar tu registro y activar tu cuenta, 
          necesitamos verificar que este email te pertenece.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, #0A2A5F, #1E40AF); 
                      color: white; 
                      padding: 20px; 
                      border-radius: 12px; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      border: 3px solid #1E40AF;">
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Tu código de verificación es:</p>
            <h1 style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </h1>
          </div>
        </div>
        
        <div style="background: #e6f3ff; border-left: 4px solid #0A2A5F; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #0A2A5F; font-weight: bold;">⚠️ Información importante:</p>
          <ul style="margin: 10px 0 0 0; color: #4a5568; padding-left: 20px;">
            <li>Este código expirará en <strong>15 minutos</strong> por seguridad</li>
            <li>Solo puedes usar este código <strong>3 veces</strong></li>
            <li>Si no funciona, solicita un nuevo código de verificación</li>
            <li>Después de 3 intentos fallidos, el código se bloqueará por 30 minutos</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-weight: bold;">🔒 Seguridad:</p>
          <p style="margin: 10px 0 0 0; color: #856404;">
            Nunca compartas este código con nadie. El equipo de Mussikon nunca te pedirá tu código de verificación.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #718096; font-size: 14px; margin: 0;">
          Este correo fue enviado desde Mussikon. Si no te registraste en nuestra plataforma, 
          puedes ignorar este mensaje. Si tienes alguna pregunta, 
          contáctanos en <a href="mailto:support@mussikon.com" style="color: #0A2A5F;">support@mussikon.com</a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

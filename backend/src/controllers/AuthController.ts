import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/database';
import { config } from '../config/config';
import { AppError, createError } from '../utils/errorHandler';
import { User, CreateUserRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, SendVerificationEmailRequest, VerifyEmailRequest } from '../types';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from '../services/emailService';

export class AuthController {
  // Register new user
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const { email, password } = userData;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw createError('User with this email already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userId = uuidv4();
      const newUser: Partial<User> = {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        active_role: userData.role === 'musician' ? 'musician' : 'leader',
        status: userData.role === 'leader' ? 'active' : 'pending',
        church_name: userData.church_name || '',
        location: userData.location || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (userError) {
        console.error('Error creating user:', userError);
        throw createError('Failed to create user', 500);
      }

      // Store hashed password separately (in a passwords table)
      const { error: passwordError } = await supabase
        .from('user_passwords')
        .insert([{
          user_id: userId,
          password: hashedPassword,
          created_at: new Date().toISOString()
        }]);

      if (passwordError) {
        console.error('Error storing password:', passwordError);
        throw createError('Failed to store password', 500);
      }

      // Add instruments if user is a musician
      if (userData.role === 'musician' && userData.instruments) {
        const instrumentsData = userData.instruments.map(instrument => ({
          id: uuidv4(),
          user_id: userId,
          instrument: instrument.instrument,
          years_experience: instrument.years_experience,
          created_at: new Date().toISOString()
        }));

        const { error: instrumentsError } = await supabase
          .from('user_instruments')
          .insert(instrumentsData);

        if (instrumentsError) {
          console.error('Failed to add instruments:', instrumentsError);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      // Generate email verification token
      const verificationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

      // Save verification token to database
      const { error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert([{
          user_id: user.id,
          token: verificationToken,
          expires_at: expiresAt.toISOString(),
          used: false
        }]);

      if (tokenError) {
        console.error('Error creating verification token:', tokenError);
        // Don't fail registration if token creation fails
      }

      // Send verification email
      try {
        await sendEmailVerificationEmail(user.email, user.name, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        user: user as User,
        token
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Login user
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Get user and password
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*, active_role')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw createError('Invalid email or password', 401);
      }

      // Get hashed password
      const { data: passwordData, error: passwordError } = await supabase
        .from('user_passwords')
        .select('password')
        .eq('user_id', user.id)
        .single();

      if (passwordError || !passwordData) {
        throw createError('Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, passwordData.password);
      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw createError('Account is not active. Please wait for approval.', 403);
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        user: user as User,
        token
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };


  // Logout user
  public logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // In a real app, you might want to blacklist the token
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Forgot password - Send reset email
  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email, status')
        .eq('email', email)
        .single();

      if (userError || !user) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
        });
        return;
      }

      // Check if user is active
      if (user.status !== 'active') {
        res.status(200).json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
        });
        return;
      }

      // Generate reset token
      const resetToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Save reset token to database
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .insert([{
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false
        }]);

      if (tokenError) {
        console.error('Error creating reset token:', tokenError);
        throw createError('Failed to create reset token', 500);
      }

      // Send reset email
      try {
        await sendPasswordResetEmail(user.email, user.name, resetToken);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Forgot password error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Reset password - Validate token and set new password
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, new_password }: ResetPasswordRequest = req.body;

      // Validate password strength
      if (new_password.length < 8) {
        throw createError('La contraseña debe tener al menos 8 caracteres', 400);
      }

      // Find valid reset token
      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*, user:users(id, name, email)')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        throw createError('Token inválido o expirado', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 12);

      // Update password in database
      const { error: passwordError } = await supabase
        .from('user_passwords')
        .update({ password: hashedPassword })
        .eq('user_id', resetToken.user_id);

      if (passwordError) {
        console.error('Error updating password:', passwordError);
        throw createError('Failed to update password', 500);
      }

      // Mark token as used
      const { error: updateTokenError } = await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetToken.id);

      if (updateTokenError) {
        console.error('Error updating token:', updateTokenError);
        // Don't fail the request if token update fails
      }

      res.status(200).json({
        success: true,
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Reset password error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Validate reset token
  public validateResetToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      // Find valid reset token
      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('id, expires_at, used')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token válido'
      });
    } catch (error) {
      console.error('Validate reset token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Send verification email
  public sendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email }: SendVerificationEmailRequest = req.body;

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email, status')
        .eq('email', email)
        .single();

      if (userError || !user) {
        // Don't reveal if user exists or not for security
        res.status(200).json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace de verificación.'
        });
        return;
      }

      // Check if user is already verified (you might want to add an email_verified field)
      // For now, we'll just send the email regardless

      // Generate new verification token
      const verificationToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

      // Save verification token to database
      const { error: tokenError } = await supabase
        .from('email_verification_tokens')
        .insert([{
          user_id: user.id,
          token: verificationToken,
          expires_at: expiresAt.toISOString(),
          used: false
        }]);

      if (tokenError) {
        console.error('Error creating verification token:', tokenError);
        throw createError('Failed to create verification token', 500);
      }

      // Send verification email
      try {
        await sendEmailVerificationEmail(user.email, user.name, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de verificación.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Send verification email error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Verify email with token
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token }: VerifyEmailRequest = req.body;

      // Find valid verification token
      const { data: verificationToken, error: tokenError } = await supabase
        .from('email_verification_tokens')
        .select('*, user:users(id, name, email, status)')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !verificationToken) {
        throw createError('Token de verificación inválido o expirado', 400);
      }

      // Mark token as used
      const { error: updateTokenError } = await supabase
        .from('email_verification_tokens')
        .update({ used: true })
        .eq('id', verificationToken.id);

      if (updateTokenError) {
        console.error('Error updating token:', updateTokenError);
        // Don't fail the request if token update fails
      }

      // Update user status to active (if they were pending)
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationToken.user_id);

      if (updateUserError) {
        console.error('Error updating user status:', updateUserError);
        // Don't fail the request if user update fails
      }

      res.status(200).json({
        success: true,
        message: 'Email verificado exitosamente. Tu cuenta ha sido activada.'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Verify email error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Validate verification token
  public validateVerificationToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;

      // Find valid verification token
      const { data: verificationToken, error: tokenError } = await supabase
        .from('email_verification_tokens')
        .select('id, expires_at, used')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !verificationToken) {
        res.status(400).json({
          success: false,
          message: 'Token de verificación inválido o expirado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token de verificación válido'
      });
    } catch (error) {
      console.error('Validate verification token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}

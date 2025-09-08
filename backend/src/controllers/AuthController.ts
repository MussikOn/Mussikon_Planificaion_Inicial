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
          message: 'Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.'
        });
        return;
      }

      // Check if user is active
      if (user.status !== 'active') {
        res.status(200).json({
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.'
        });
        return;
      }

      // Generate verification code using database function
      const { data: resetCode, error: codeError } = await supabase
        .rpc('create_email_verification_code', { p_user_id: user.id });

      if (codeError) {
        console.error('Error generating reset code:', codeError);
        throw createError('Failed to create reset code', 500);
      }

      // Send reset email with code
      try {
        await sendPasswordResetEmail(user.email, user.name, resetCode);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un código para restablecer tu contraseña.'
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

  // Reset password - Validate code and set new password
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, email, new_password }: ResetPasswordRequest = req.body;

      if (!code || !email || !new_password) {
        throw createError('Verification code, email and new password are required', 400);
      }

      // Validate password strength
      if (new_password.length < 8) {
        throw createError('La contraseña debe tener al menos 8 caracteres', 400);
      }

      // Find valid reset token
      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('id, expires_at, used, user_id')
        .eq('code', code)
        .eq('email', email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        throw createError('Código inválido o expirado', 400);
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

      // Mark the reset token as used
      const { error: updateTokenError } = await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetToken.id);

      if (updateTokenError) {
        console.error('Error marking token as used:', updateTokenError);
        // Decide if this should be a critical error or just log it
        // For now, we'll log it and proceed, as password was already updated
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

  // Validate reset code
  public validateResetCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, email } = req.body;

      if (!code || !email) {
        throw createError('Verification code and email are required', 400);
      }

      // Find valid reset token
      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('id, expires_at, used, user_id')
        .eq('code', code)
        .eq('email', email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !resetToken) {
        throw createError('Código inválido o expirado', 400);
      }

      // Mark the token as used
      const { error: updateTokenError } = await supabase
        .from('password_reset_tokens')
        .update({ used: true, updated_at: new Date().toISOString() })
        .eq('id', resetToken.id);

      if (updateTokenError) {
        console.error('Error marking token as used:', updateTokenError);
        throw createError('Failed to update token status', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Código de verificación válido'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Validate reset code error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
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
          message: 'Si el email existe en nuestro sistema, recibirás un código de verificación.'
        });
        return;
      }

      // Check if user is already verified (you might want to add an email_verified field)
      // For now, we'll just send the email regardless

      // Generate verification code using database function
      const { data: verificationCode, error: codeError } = await supabase
        .rpc('create_email_verification_code', { p_user_id: user.id });

      if (codeError) {
        console.error('Error generating verification code:', codeError);
        throw createError('Failed to create verification code', 500);
      }

      // Send verification email
      try {
        await sendEmailVerificationEmail(user.email, user.name, verificationCode);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás un código de verificación.'
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

  // Verify email with code
  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, email }: VerifyEmailRequest = req.body;

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email, status')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw createError('Usuario no encontrado', 404);
      }

      // Verify code using database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_email_code', { 
          p_user_id: user.id, 
          p_code: code 
        });

      if (verifyError) {
        console.error('Error verifying code:', verifyError);
        throw createError('Error al verificar el código', 500);
      }

      if (!isValid) {
        // Check if code is locked
        const { data: tokenData } = await supabase
          .from('email_verification_tokens')
          .select('attempts, max_attempts, locked_until')
          .eq('user_id', user.id)
          .eq('verification_code', code)
          .eq('used', false)
          .single();

        if (tokenData && tokenData.locked_until && new Date(tokenData.locked_until) > new Date()) {
          const lockTime = new Date(tokenData.locked_until);
          throw createError(`Código bloqueado. Intenta nuevamente después de ${lockTime.toLocaleString()}`, 429);
        }

        if (tokenData && tokenData.attempts >= tokenData.max_attempts) {
          throw createError('Código bloqueado por demasiados intentos fallidos', 429);
        }

        throw createError('Código de verificación inválido o expirado', 400);
      }

      // Update user status to active (if they were pending)
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

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

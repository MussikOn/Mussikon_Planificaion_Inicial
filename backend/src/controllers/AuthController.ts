import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/database';
import { config } from '../config/config';
import { AppError, createError } from '../utils/errorHandler';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types';
import { sendEmail } from '../services/emailService';

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

      // Send verification email (disabled in development)
      if (config.nodeEnv === 'production') {
        try {
          await sendEmail({
            to: user.email,
            subject: 'Welcome to Mussikon - Email Verification',
            html: `
              <h2>Welcome to Mussikon!</h2>
              <p>Thank you for registering. Please verify your email address to complete your registration.</p>
              <p>Your account is ${user.role === 'leader' ? 'active' : 'pending approval'}.</p>
              <p>Best regards,<br>The Mussikon Team</p>
            `
          });
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }
      } else {
        console.log(`[DEV] Email verification would be sent to: ${user.email}`);
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

  // Verify email
  public verifyEmail = async (_req: Request, res: Response): Promise<void> => {
    try {
      // const { email } = req.body;

      // This is a placeholder - in a real app, you'd verify the email token
      res.status(200).json({
        success: true,
        message: 'Email verification sent'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
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
}

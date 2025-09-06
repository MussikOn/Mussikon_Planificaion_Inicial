import { Request, Response } from 'express';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';
// import { User, UserFilters } from '../types';

export class UserController {
  // Get user profile
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw createError('User not found', 404);
      }

      // Get user instruments if user is a musician
      let instruments = [];
      if (user.role === 'musician') {
        const { data: userInstruments } = await supabase
          .from('user_instruments')
          .select('*')
          .eq('user_id', userId);

        instruments = userInstruments || [];
      }

      res.status(200).json({
        success: true,
        data: { ...user, instruments }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get profile error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Update user profile
  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const updateData = req.body;

      // Remove sensitive fields
      delete updateData.id;
      delete updateData.email;
      delete updateData.role;
      delete updateData.status;
      delete updateData.created_at;

      updateData.updated_at = new Date().toISOString();

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw createError('Failed to update profile', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Update profile error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get user by ID
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, status, church_name, location, created_at')
        .eq('id', id)
        .single();

      if (error || !user) {
        throw createError('User not found', 404);
      }

      // Get user instruments if user is a musician
      let instruments = [];
      if (user.role === 'musician') {
        const { data: userInstruments } = await supabase
          .from('user_instruments')
          .select('*')
          .eq('user_id', id);

        instruments = userInstruments || [];
      }

      res.status(200).json({
        success: true,
        data: { ...user, instruments }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get user by ID error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}

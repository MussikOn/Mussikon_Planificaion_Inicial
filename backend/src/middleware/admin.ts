import { Request, Response, NextFunction } from 'express';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    // Check if user is admin
    const { data: user, error } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw createError('User not found', 404);
    }

    if (user.role !== 'admin') {
      throw createError('Admin access required', 403);
    }

    if (user.status !== 'active') {
      throw createError('Admin account is not active', 403);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    } else {
      console.error('Admin middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

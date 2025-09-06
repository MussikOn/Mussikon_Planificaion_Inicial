import { Request, Response } from 'express';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';
import { sendValidationEmail } from '../services/emailService';
import { UserFilters } from '../types';
import bcrypt from 'bcryptjs';

export class AdminController {
  // Get musicians for validation
  public getMusicians = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = req.query;
      const page = parseInt(filters.page?.toString() || '1');
      const limit = parseInt(filters.limit?.toString() || '10');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('users')
        .select(`
          *,
          instruments:user_instruments(*)
        `)
        .eq('role', 'musician')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.instrument) {
        query = query.eq('instruments.instrument', filters.instrument);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: musicians, error } = await query;

      if (error) {
        throw createError('Failed to fetch musicians', 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.status(200).json({
        success: true,
        data: musicians || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get musicians error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Approve musician
  public approveMusician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = (req as any).user.userId;
      const { reason } = req.body;

      // Check if musician exists
      const { data: musician, error: musicianError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'musician')
        .single();

      if (musicianError || !musician) {
        throw createError('Musician not found', 404);
      }

      if (musician.status === 'active') {
        throw createError('Musician is already approved', 400);
      }

      // Update musician status
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw createError('Failed to approve musician', 500);
      }

      // Record admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          user_id: id,
          action: 'approve',
          reason: reason || 'Approved by admin',
          created_at: new Date().toISOString()
        }]);

      if (actionError) {
        console.error('Failed to record admin action:', actionError);
      }

      // Send notification email
      try {
        await sendValidationEmail(musician.email, musician.name, 'approved');
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Musician approved successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Approve musician error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Reject musician
  public rejectMusician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = (req as any).user.userId;
      const { reason } = req.body;

      if (!reason) {
        throw createError('Reason is required for rejection', 400);
      }

      // Check if musician exists
      const { data: musician, error: musicianError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'musician')
        .single();

      if (musicianError || !musician) {
        throw createError('Musician not found', 404);
      }

      if (musician.status === 'rejected') {
        throw createError('Musician is already rejected', 400);
      }

      // Update musician status
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw createError('Failed to reject musician', 500);
      }

      // Record admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          user_id: id,
          action: 'reject',
          reason: reason,
          created_at: new Date().toISOString()
        }]);

      if (actionError) {
        console.error('Failed to record admin action:', actionError);
      }

      // Send notification email
      try {
        await sendValidationEmail(musician.email, musician.name, 'rejected');
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      res.status(200).json({
        success: true,
        message: 'Musician rejected successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Reject musician error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get admin stats
  public getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Get user counts by role and status
      const { data: userStats } = await supabase
        .from('users')
        .select('role, status')
        .neq('role', 'admin');

      // Get request counts
      const { count: totalRequests } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true });

      const { count: activeRequests } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get offer counts
      const { count: totalOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true });

      const { count: selectedOffers } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'selected');

      // Process user stats
      const stats = {
        users: {
          total: userStats?.length || 0,
          leaders: userStats?.filter(u => u.role === 'leader').length || 0,
          musicians: userStats?.filter(u => u.role === 'musician').length || 0,
          active: userStats?.filter(u => u.status === 'active').length || 0,
          pending: userStats?.filter(u => u.status === 'pending').length || 0,
          rejected: userStats?.filter(u => u.status === 'rejected').length || 0
        },
        requests: {
          total: totalRequests || 0,
          active: activeRequests || 0
        },
        offers: {
          total: totalOffers || 0,
          selected: selectedOffers || 0
        }
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // Change user password
  public changeUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        throw createError('Password must be at least 6 characters long', 400);
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw createError('User not found', 404);
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password in user_passwords table
      const { error: passwordError } = await supabase
        .from('user_passwords')
        .upsert({
          user_id: userId,
          password: hashedPassword
        });

      if (passwordError) {
        throw createError('Failed to update password', 500);
      }

      // Log admin action
      const adminId = (req as any).user.userId;
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          user_id: userId,
          action: 'password_changed',
          details: `Password changed for user ${user.name} (${user.email})`
        });

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Change password error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get all users for management
  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = req.query;
      const page = parseInt(filters.page?.toString() || '1');
      const limit = parseInt(filters.limit?.toString() || '10');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('users')
        .select(`
          *,
          instruments:user_instruments(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: users, error } = await query;

      if (error) {
        throw createError('Failed to fetch users', 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get all users error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}

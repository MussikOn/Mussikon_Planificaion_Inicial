import { Request, Response } from 'express';
import supabase from '../config/database';
import { createError } from '../utils/errorHandler';

class NotificationController {
  // Get user notifications
  public getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw createError('Failed to fetch notifications', 500);
      }

      res.status(200).json({
        success: true,
        data: notifications || []
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Mark notification as read
  public markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw createError('Failed to mark notification as read', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Mark all notifications as read
  public markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        throw createError('Failed to mark all notifications as read', 500);
      }

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}

export const notificationController = new NotificationController();

import { Request, Response } from 'express';
import { balanceService } from '../services/balanceService';
import { AppError, createError } from '../utils/errorHandler';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class BalanceController {
  // Get user balance
  public getUserBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw createError('User not authenticated', 401);
      }

      const balance = await balanceService.getUserBalance(userId);

      res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Error getting user balance:', error);
      res.status(500).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Internal server error'
      });
    }
  };

  // Get user transactions
  public getUserTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw createError('User not authenticated', 401);
      }

      const page = parseInt(req.query['page']?.toString() || '1');
      const limit = parseInt(req.query['limit']?.toString() || '20');

      const result = await balanceService.getUserTransactions(userId, page, limit);

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      res.status(500).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Internal server error'
      });
    }
  };

  // Create transaction (admin only)
  public createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, request_id, offer_id, type, amount, description, status, currency } = req.body;

      if (!user_id || !type || !amount) {
        throw createError('Missing required fields', 400);
      }

      const transaction = await balanceService.createTransaction({
        user_id,
        request_id,
        offer_id,
        type,
        amount,
        description,
        status,
        currency
      });

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully'
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Internal server error'
      });
    }
  };

  // Update transaction status
  public updateTransactionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionId } = req.params;
      const { status } = req.body;

      if (!transactionId || !status) {
        throw createError('Missing required fields', 400);
      }

      const success = await balanceService.updateTransactionStatus(transactionId, status);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Transaction status updated successfully'
        });
      } else {
        throw createError('Failed to update transaction status', 500);
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Internal server error'
      });
    }
  };

  // Get all user balances (admin only)
  public getAllUserBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query['page']?.toString() || '1');
      const limit = parseInt(req.query['limit']?.toString() || '20');

      const result = await balanceService.getAllUserBalances(page, limit);

      res.status(200).json({
        success: true,
        data: result.balances,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Error getting all user balances:', error);
      res.status(500).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Internal server error'
      });
    }
  };

  // Process earning when offer is selected
  public processEarning = async (req: Request, res: Response): Promise<void> => {
    try {
      const { offerId, requestId } = req.body;

      if (!offerId || !requestId) {
        throw createError('Missing required fields', 400);
      }

      const success = await balanceService.processEarning(offerId, requestId);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Earning processed successfully'
        });
      } else {
        throw createError('Failed to process earning', 500);
      }
    } catch (error) {
      console.error('Error processing earning:', error);
      res.status(500).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Internal server error'
      });
    }
  };
}

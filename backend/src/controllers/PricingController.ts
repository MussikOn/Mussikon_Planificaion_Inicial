import { Request, Response } from 'express';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';
import { UpdatePricingConfigRequest } from '../types';
import { pricingService } from '../services/pricingService';
import { logger } from '../utils/logger';

export class PricingController {
  // Get current pricing configuration
  public getPricingConfig = async (_req: Request, res: Response): Promise<void> => {
    try {
      const config = await pricingService.getPricingConfig();
      
      if (!config) {
        // Initialize default pricing if none exists
        await pricingService.initializeDefaultPricing();
        const newConfig = await pricingService.getPricingConfig();
        
        res.status(200).json({
          success: true,
          data: newConfig
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Get pricing config error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting pricing configuration'
      });
    }
  };

  // Update pricing configuration
  public updatePricingConfig = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const updateData: UpdatePricingConfigRequest = req.body;

      // Check if user is admin
      const { data: user } = await supabase
        .from('users')
        .select('role, active_role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'admin') {
        throw createError('Only administrators can update pricing configuration', 403);
      }

      // Validate pricing data
      if (updateData.base_hourly_rate !== undefined && updateData.base_hourly_rate <= 0) {
        throw createError('Base hourly rate must be greater than 0', 400);
      }

      if (updateData.minimum_hours !== undefined && updateData.minimum_hours <= 0) {
        throw createError('Minimum hours must be greater than 0', 400);
      }

      if (updateData.maximum_hours !== undefined && updateData.maximum_hours <= 0) {
        throw createError('Maximum hours must be greater than 0', 400);
      }

      if (updateData.platform_commission !== undefined && 
          (updateData.platform_commission < 0 || updateData.platform_commission > 1)) {
        throw createError('Platform commission must be between 0 and 1', 400);
      }

      if (updateData.tax_rate !== undefined && 
          (updateData.tax_rate < 0 || updateData.tax_rate > 1)) {
        throw createError('Tax rate must be between 0 and 1', 400);
      }

      if (updateData.minimum_hours && updateData.maximum_hours && 
          updateData.minimum_hours >= updateData.maximum_hours) {
        throw createError('Maximum hours must be greater than minimum hours', 400);
      }

      const success = await pricingService.updatePricingConfig(updateData);
      
      if (!success) {
        throw createError('Failed to update pricing configuration', 500);
      }

      const updatedConfig = await pricingService.getPricingConfig();

      res.status(200).json({
        success: true,
        message: 'Pricing configuration updated successfully',
        data: updatedConfig
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Update pricing config error:', error);
        res.status(500).json({
          success: false,
          message: 'Error updating pricing configuration'
        });
      }
    }
  };

  // Calculate price for a request
  public calculatePrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { start_time, end_time, custom_rate } = req.query;

      if (!start_time || !end_time) {
        throw createError('start_time and end_time are required', 400);
      }

      const customRate = custom_rate ? parseFloat(custom_rate as string) : undefined;
      const calculation = await pricingService.calculatePrice(
        start_time as string,
        end_time as string,
        customRate
      );

      if (!calculation) {
        throw createError('Failed to calculate price', 500);
      }

      res.status(200).json({
        success: true,
        data: calculation
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Calculate price error:', error);
        res.status(500).json({
          success: false,
          message: 'Error calculating price'
        });
      }
    }
  };

  // Get pricing history
  public getPricingHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;

      // Check if user is admin
      const { data: user } = await supabase
        .from('users')
        .select('role, active_role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'admin') {
        throw createError('Only administrators can view pricing history', 403);
      }

      const history = await pricingService.getPricingHistory();

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Get pricing history error:', error);
        res.status(500).json({
          success: false,
          message: 'Error getting pricing history'
        });
      }
    }
  };

  // Initialize default pricing
  public initializeDefaultPricing = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;

      // Check if user is admin
      const { data: user } = await supabase
        .from('users')
        .select('role, active_role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'admin') {
        throw createError('Only administrators can initialize pricing', 403);
      }

      const success = await pricingService.initializeDefaultPricing();
      
      if (!success) {
        throw createError('Failed to initialize default pricing', 500);
      }

      const config = await pricingService.getPricingConfig();

      res.status(200).json({
        success: true,
        message: 'Default pricing configuration initialized',
        data: config
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Initialize pricing error:', error);
        res.status(500).json({
          success: false,
          message: 'Error initializing default pricing'
        });
      }
    }
  };
}

export const pricingController = new PricingController();

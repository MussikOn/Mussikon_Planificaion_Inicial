import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';
import { CreateOfferRequest } from '../types';
import { balanceService } from '../services/balanceService';
import { availabilityService } from '../services/availabilityService';
import { socketService } from '../server';
import { logger } from '../utils/logger';

export class OfferController {
  // Get offers with filters
  public getOffers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;
      const { request_id, status } = req.query;

      let query = supabase
        .from('offers')
        .select(`
          *,
          request:requests!offers_request_id_fkey(
            *,
            leader:users!requests_leader_id_fkey(id, name, church_name, location)
          ),
          musician:users!offers_musician_id_fkey(id, name, phone, location)
        `)
        .order('created_at', { ascending: false });

      // Si el usuario es músico, solo mostrar sus propias ofertas
      if (userRole === 'musician') {
        query = query.eq('musician_id', userId);
      }
      // Si el usuario es líder, solo mostrar ofertas de sus propias solicitudes
      else if (userRole === 'leader') {
        query = query.eq('request.leader_id', userId);
      }

      // Apply filters
      if (request_id) {
        query = query.eq('request_id', request_id);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data: offers, error } = await query;

      if (error) {
        throw createError('Failed to fetch offers', 500);
      }

      res.status(200).json({
        success: true,
        data: offers || []
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Get offers error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get leader's offers (offers for their requests)
  public getLeaderOffers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const { status } = req.query;

      let query = supabase
        .from('offers')
        .select(`
          *,
          request:requests!offers_request_id_fkey(
            *,
            leader:users!requests_leader_id_fkey(id, name, church_name, location)
          ),
          musician:users!offers_musician_id_fkey(id, name, phone, location)
        `)
        .eq('request.leader_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      const { data: offers, error } = await query;

      if (error) {
        throw createError('Failed to fetch leader offers', 500);
      }

      res.status(200).json({
        success: true,
        data: offers || []
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Get leader offers error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get musician's own offers
  public getMusicianOffers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const { status } = req.query;

      let query = supabase
        .from('offers')
        .select(`
          *,
          request:requests!offers_request_id_fkey(
            *,
            leader:users!requests_leader_id_fkey(id, name, church_name, location)
          )
        `)
        .eq('musician_id', userId)
        .order('created_at', { ascending: false });

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      const { data: offers, error } = await query;

      if (error) {
        throw createError('Failed to fetch musician offers', 500);
      }

      res.status(200).json({
        success: true,
        data: offers || []
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Get musician offers error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Create new offer
  public createOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const offerData: CreateOfferRequest = req.body;

      // Check if user is a musician
      const { data: user } = await supabase
        .from('users')
        .select('role, active_role, status')
        .eq('id', userId)
        .single();

      const userActiveRole = user?.active_role || user?.role;
      if (!user || (userActiveRole !== 'musician' && user.role !== 'admin')) {
        throw createError('Only musicians and admins can create offers', 403);
      }

      if (user.status !== 'active') {
        throw createError('Account is not active', 403);
      }

      // Check if request exists and is active
      const { data: request } = await supabase
        .from('requests')
        .select('id, status, leader_id, event_date, start_time, end_time')
        .eq('id', offerData.request_id)
        .single();

      if (!request) {
        throw createError('Request not found', 404);
      }

      if (request.status !== 'active') {
        throw createError('Request is not active', 400);
      }

      // Check musician availability
      const availability = await availabilityService.checkAvailability({
        musician_id: userId,
        date: request.event_date,
        start_time: request.start_time,
        end_time: request.end_time
      });

      if (!availability.is_available) {
        throw createError(availability.message, 400);
      }

      // Check if musician already made an offer for this request
      const { data: existingOffer } = await supabase
        .from('offers')
        .select('id')
        .eq('request_id', offerData.request_id)
        .eq('musician_id', userId)
        .single();

      if (existingOffer) {
        throw createError('You have already made an offer for this request', 400);
      }

      const newOffer = {
        id: uuidv4(),
        musician_id: userId,
        ...offerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: offer, error } = await supabase
        .from('offers')
        .insert([newOffer])
        .select(`
          *,
          request:requests!offers_request_id_fkey(
            *,
            leader:users!requests_leader_id_fkey(id, name, church_name, location)
          ),
          musician:users!offers_musician_id_fkey(id, name, phone, location)
        `)
        .single();

      if (error) {
        throw createError('Failed to create offer', 500);
      }

      // Notify the leader about the new offer
      try {
        socketService.notifyNewOffer(request.leader_id, offer);
      } catch (notificationError) {
        logger.error('Error sending notification:', notificationError);
        // Don't fail the offer creation if notification fails
      }

      res.status(201).json({
        success: true,
        message: 'Offer created successfully',
        data: offer
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Create offer error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get offer by ID
  public getOfferById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: offer, error } = await supabase
        .from('offers')
        .select(`
          *,
          request:requests!offers_request_id_fkey(
            *,
            leader:users!requests_leader_id_fkey(id, name, church_name, location)
          ),
          musician:users!offers_musician_id_fkey(id, name, phone, location)
        `)
        .eq('id', id)
        .single();

      if (error || !offer) {
        throw createError('Offer not found', 404);
      }

      res.status(200).json({
        success: true,
        data: offer
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Get offer by ID error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Select offer
  public selectOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      // Get offer and request details
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select(`
          *,
          request:requests!offers_request_id_fkey(leader_id, status, event_date, start_time, end_time)
        `)
        .eq('id', id)
        .single();

      if (offerError || !offer) {
        throw createError('Offer not found', 404);
      }

      // Check if user is the leader of the request
      if (offer.request.leader_id !== userId) {
        throw createError('Unauthorized to select this offer', 403);
      }

      if (offer.request.status !== 'active') {
        throw createError('Request is not active', 400);
      }

      // Update offer status to selected
      const { error: updateError } = await supabase
        .from('offers')
        .update({ 
          status: 'selected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw createError('Failed to select offer', 500);
      }

      // Update request status to 'accepted' and assign musician
      const { error: updateRequestError } = await supabase
        .from('requests')
        .update({
          status: 'accepted',
          musician_id: offer.musician_id,
          musician_status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', offer.request_id);

      if (updateRequestError) {
        logger.error('Failed to update request status after offer selection:', updateRequestError);
        throw createError('Failed to update request status', 500);
      }

      // Reject all other offers for this request
      const { error: rejectError } = await supabase
        .from('offers')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('request_id', offer.request_id)
        .neq('id', id);

      if (rejectError) {
        logger.error('Failed to reject other offers:', rejectError);
      }

      // Block musician availability
      await availabilityService.blockAvailability(
        offer.musician_id,
        offer.request.event_date,
        offer.request.start_time,
        offer.request.end_time,
        offer.request_id
      );

      // Process earning for the musician
      try {
        await balanceService.processEarning(offer.id, offer.request_id);
      } catch (balanceError) {
        logger.error('Failed to process earning:', balanceError);
        // Don't fail the offer selection if balance processing fails
      }

      // Close the request
      const { error: closeRequestError } = await supabase
        .from('requests')
        .update({ 
          status: 'accepted',
          accepted_by_musician_id: offer.musician_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', offer.request_id);

      if (closeRequestError) {
        logger.error('Failed to close request:', closeRequestError);
      }

      res.status(200).json({
        success: true,
        message: 'Offer selected successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Select offer error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Reject offer
  public rejectOffer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      // Get offer and request details
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select(`
          *,
          request:requests!offers_request_id_fkey(leader_id)
        `)
        .eq('id', id)
        .single();

      if (offerError || !offer) {
        throw createError('Offer not found', 404);
      }

      // Check if user is the leader of the request
      if (offer.request.leader_id !== userId) {
        throw createError('Unauthorized to reject this offer', 403);
      }

      // Update offer status to rejected
      const { error: updateError } = await supabase
        .from('offers')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw createError('Failed to reject offer', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Offer rejected successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Reject offer error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}

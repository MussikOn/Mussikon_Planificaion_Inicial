import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';
import { CreateRequestRequest, RequestFilters } from '../types';

export class RequestController {
  // Get requests with filters
  public getRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: RequestFilters = req.query;
      const page = parseInt(filters.page?.toString() || '1');
      const limit = parseInt(filters.limit?.toString() || '10');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('requests')
        .select(`
          *,
          leader:users!requests_leader_id_fkey(id, name, church_name, location)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.instrument) {
        query = query.eq('required_instrument', filters.instrument);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.min_budget) {
        query = query.gte('budget', filters.min_budget);
      }
      if (filters.max_budget) {
        query = query.lte('budget', filters.max_budget);
      }
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: requests, error } = await query;

      if (error) {
        throw createError('Failed to fetch requests', 500);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      res.status(200).json({
        success: true,
        data: requests || [],
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
        console.error('Get requests error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Create new request
  public createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const requestData: CreateRequestRequest = req.body;

      // Check if user is a leader
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user || (user.role !== 'leader' && user.role !== 'admin')) {
        throw createError('Only leaders and admins can create requests', 403);
      }

      const newRequest = {
        id: uuidv4(),
        leader_id: userId,
        ...requestData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: request, error } = await supabase
        .from('requests')
        .insert([newRequest])
        .select(`
          *,
          leader:users!requests_leader_id_fkey(id, name, church_name, location)
        `)
        .single();

      if (error) {
        throw createError('Failed to create request', 500);
      }

      res.status(201).json({
        success: true,
        message: 'Request created successfully',
        data: request
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Create request error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get request by ID
  public getRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: request, error } = await supabase
        .from('requests')
        .select(`
          *,
          leader:users!requests_leader_id_fkey(id, name, church_name, location),
          offers:offers(
            *,
            musician:users!offers_musician_id_fkey(id, name, phone, location)
          )
        `)
        .eq('id', id)
        .single();

      if (error || !request) {
        throw createError('Request not found', 404);
      }

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get request by ID error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Update request
  public updateRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const updateData = req.body;

      // Check if user owns the request
      const { data: request } = await supabase
        .from('requests')
        .select('leader_id')
        .eq('id', id)
        .single();

      if (!request || request.leader_id !== userId) {
        throw createError('Unauthorized to update this request', 403);
      }

      updateData.updated_at = new Date().toISOString();

      const { data: updatedRequest, error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          leader:users!requests_leader_id_fkey(id, name, church_name, location)
        `)
        .single();

      if (error) {
        throw createError('Failed to update request', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Request updated successfully',
        data: updatedRequest
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Update request error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Delete request
  public deleteRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      // Check if user owns the request
      const { data: request } = await supabase
        .from('requests')
        .select('leader_id')
        .eq('id', id)
        .single();

      if (!request || request.leader_id !== userId) {
        throw createError('Unauthorized to delete this request', 403);
      }

      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);

      if (error) {
        throw createError('Failed to delete request', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Request deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Delete request error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}

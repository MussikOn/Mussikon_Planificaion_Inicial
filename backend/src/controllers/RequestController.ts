import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/database';
import { AppError, createError } from '../utils/errorHandler';
import { CreateRequestRequest, RequestFilters } from '../types'; 
import { socketService } from '../server';
import { logger } from '../utils/logger';

export class RequestController {
  private socketService = socketService;

  // Get requests with filters
  public getRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;
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
        .order('created_at', { ascending: false });

      // Si el usuario es líder, solo mostrar sus propias solicitudes
      if (userRole === 'leader') {
        query = query.eq('leader_id', userId);
      } else if (userRole === 'musician') {
        // Los músicos ven todas las solicitudes activas
        query = query.eq('status', 'active');
      }
      // Los admins ven todas las solicitudes (sin filtro adicional)

      // Apply filters
      if (filters.instrument) {
        query = query.eq('required_instrument', filters.instrument);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.min_extra_amount) {
        query = query.gte('extra_amount', filters.min_extra_amount);
      }
      if (filters.max_extra_amount) {
        query = query.lte('extra_amount', filters.max_extra_amount);
      }
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      // Get total count
      const { count } = await query;

      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      console.info('Query:', (await query).data);
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
        logger.error('Get requests error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get leader's own requests
  public getLeaderRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
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
        .eq('leader_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.instrument) {
        query = query.eq('required_instrument', filters.instrument);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.min_extra_amount) {
        query = query.gte('extra_amount', filters.min_extra_amount);
      }
      if (filters.max_extra_amount) {
        query = query.lte('extra_amount', filters.max_extra_amount);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: requests, error } = await query;

      if (error) {
        throw createError('Failed to fetch leader requests', 500);
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('leader_id', userId);

      res.status(200).json({
        success: true,
        data: requests || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Get leader requests error:', error);
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
        .select('role, active_role')
        .eq('id', userId)
        .single();

      const userActiveRole = user?.active_role || user?.role;
      if (!user || (userActiveRole !== 'leader' && user.role !== 'admin')) {
        throw createError('Only leaders and admins can create requests', 403);
      }

      // Validate required fields
      if (!requestData.start_time || !requestData.end_time) {
        throw createError('start_time and end_time are required', 400);
      }

      // Validate time format and logic
      if (requestData.start_time >= requestData.end_time) {
        throw createError('end_time must be after start_time', 400);
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

      // Notify all musicians about the new request
      try {
        await socketService.notifyNewRequest(request);
      } catch (notificationError) {
        logger.error('Error sending notification:', notificationError);
        // Don't fail the request creation if notification fails
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
        logger.error('Create request error:', error);
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
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;

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

      // Check permissions based on user role
      if (userRole === 'leader') {
        // Leaders can only see their own requests
        if (request.leader_id !== userId) {
          throw createError('Acceso denegado. No tienes permisos para ver esta solicitud.', 403);
        }
      } else if (userRole === 'musician') {
        // Musicians can see active requests
        if (request.status !== 'active') {
          throw createError('Acceso denegado. Solo puedes ver solicitudes activas.', 403);
        }
      }
      // Admins can see all requests (no additional check needed)

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
        logger.error('Get request by ID error:', error);
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
        logger.error('Update request error:', error);
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
        logger.error('Delete request error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };


  // Complete request
  public completeRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      // Check if user owns the request
      const { data: request } = await supabase
        .from('requests')
        .select('leader_id, status')
        .eq('id', id)
        .single();

      if (!request) {
        throw createError('Request not found', 404);
      }

      if (request.leader_id !== userId) {
        throw createError('Unauthorized to complete this request', 403);
      }

      if (request.status !== 'active') {
        throw createError('Only active requests can be completed', 400);
      }

      // Update request status to completed
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw createError('Failed to complete request', 500);
      }

      res.status(200).json({
        success: true,
        message: 'Request completed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        logger.error('Complete request error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Get user's own requests (for leaders)
  public getUserRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query['page']?.toString() || '1');
      const limit = parseInt(req.query['limit']?.toString() || '10');
      const offset = (page - 1) * limit;

      // Get user's requests with offers count
      const { data: requests, error } = await supabase
        .from('requests')
        .select(`
          *,
          offers_count:offers(count),
          selected_offer:offers!offers_request_id_fkey(
            id,
            proposed_price,
            musician:users!offers_musician_id_fkey(name)
          )
        `)
        .eq('leader_id', userId)
        .eq('offers.status', 'selected')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw createError('Failed to fetch user requests', 500);
      }

      // Get total count
      const { count } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('leader_id', userId);

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
        logger.error('Get user requests error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // Start event (musician marks event as started)
  public startEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;

      // Only musicians can start events
      if (userRole !== 'musician') {
        res.status(403).json({
          success: false,
          message: 'Solo los músicos pueden iniciar eventos'
        });
        return;
      }

      // Check if request exists and get details
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check if musician has an accepted offer for this request
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('request_id', requestId)
        .eq('musician_id', userId)
        .eq('status', 'selected')
        .single();

      if (offerError || !offer) {
        res.status(403).json({
          success: false,
          message: 'No tienes una oferta aceptada para este evento'
        });
        return;
      }

      // Check if event can be started (logic in Node.js)
      const canStart = this.canStartEvent(request);

      if (!canStart) {
        res.status(400).json({
          success: false,
          message: 'El evento no puede ser iniciado en este momento. Debe iniciarse en la fecha y hora programada.'
        });
        return;
      }

      // Update request to mark as started
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          event_status: 'started',
          event_started_at: new Date().toISOString(),
          started_by_musician_id: userId
        })
        .eq('id', requestId);

      if (updateError) {
        logger.error('Error starting event:', updateError);
        res.status(500).json({
          success: false,
          message: 'Error al iniciar el evento'
        });
        return;
      }

      // Emit WebSocket event
      if (this.socketService) {
        this.socketService.emitToUser(request.leader_id, 'event_started', {
          request_id: requestId,
          musician_id: userId,
          started_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Evento iniciado exitosamente',
        data: {
          request_id: requestId,
          event_status: 'started',
          started_at: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Start event error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Complete event (leader marks event as completed)
  public completeEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;

      // Only leaders can complete events
      if (userRole !== 'leader') {
        res.status(403).json({
          success: false,
          message: 'Solo los líderes pueden completar eventos'
        });
        return;
      }

      // Check if request exists and belongs to the leader
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .eq('leader_id', userId)
        .single();

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check if event can be completed (simplified logic)
      const now = new Date();
      const eventStartDateTime = new Date(request.event_date + 'T' + request.start_time);
      
      // Allow completion if current time is past event start time
      if (now < eventStartDateTime) {
        res.status(400).json({
          success: false,
          message: 'No puedes completar el evento antes de la fecha y hora programada.'
        });
        return;
      }
      
      // Check if event is already completed or cancelled
      if (request.event_status && ['completed', 'cancelled'].includes(request.event_status)) {
        res.status(400).json({
          success: false,
          message: 'El evento ya ha sido completado o cancelado.'
        });
        return;
      }

      // Update request to mark as completed
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          event_status: 'completed',
          event_completed_at: new Date().toISOString(),
          status: 'closed'
        })
        .eq('id', requestId);

      if (updateError) {
        logger.error('Error completing event:', updateError);
        res.status(500).json({
          success: false,
          message: 'Error al completar el evento'
        });
        return;
      }

      // Emit WebSocket event
      if (this.socketService) {
        this.socketService.emitToUser(request.started_by_musician_id, 'event_completed', {
          request_id: requestId,
          completed_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Evento completado exitosamente',
        data: {
          request_id: requestId,
          event_status: 'completed',
          completed_at: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Complete event error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Get event status and time controls
  public getEventStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = (req as any).user.userId;

      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check permissions
      const userRole = (req as any).user.active_role || (req as any).user.role;
      if (userRole !== 'admin' && request.leader_id !== userId) {
        // Check if user is the musician who started the event
        if (request.started_by_musician_id !== userId) {
          res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver este evento'
          });
          return;
        }
      }

      // Check if event can be started
      const canStart = this.canStartEvent(request);

      // Check if event can be completed
      const canComplete = this.canCompleteEvent(request);

      res.json({
        success: true,
        data: {
          request_id: requestId,
          event_status: request.event_status,
          event_date: request.event_date,
          start_time: request.start_time,
          end_time: request.end_time,
          event_started_at: request.event_started_at,
          event_completed_at: request.event_completed_at,
          started_by_musician_id: request.started_by_musician_id,
          can_start: canStart || false,
          can_complete: canComplete || false,
          current_time: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Get event status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Helper method to check if event can be started
  private canStartEvent(request: any): boolean {
    const now = new Date();
    const eventDateTime = new Date(request.event_date + 'T' + request.start_time);
    
    // Check if event is already started or completed
    if (request.event_status && ['started', 'completed'].includes(request.event_status)) {
      return false;
    }
    
    // Allow starting 15 minutes before scheduled time
    const earliestStart = new Date(eventDateTime.getTime() - 15 * 60 * 1000);
    // Allow starting up to 1 hour after scheduled time
    const latestStart = new Date(eventDateTime.getTime() + 60 * 60 * 1000);
    
    return now >= earliestStart && now <= latestStart;
  }

  // Helper method to check if event can be completed
  private canCompleteEvent(request: any): boolean {
    const now = new Date();
    
    // Check if event is already completed or cancelled
    if (request.event_status && ['completed', 'cancelled'].includes(request.event_status)) {
      return false;
    }
    
    // Calculate event start datetime
    if (request.event_date && request.start_time) {
      const eventStartDateTime = new Date(request.event_date + 'T' + request.start_time);
      
      // Check if current time is before event start time
      if (now < eventStartDateTime) {
        return false;
      }
      
      // Allow completion if:
      // 1. Event is started and at least 2 minutes have passed since it started, OR
      // 2. Current time is past the event start time (even if not marked as started)
      if (request.event_status === 'started' && request.event_started_at) {
        // Check if at least 2 minutes have passed since event started
        const startedAt = new Date(request.event_started_at);
        const twoMinutesLater = new Date(startedAt.getTime() + 2 * 60 * 1000);
        
        if (now >= twoMinutesLater) {
          return true;
        }
      } else {
        // Event is not started yet, but current time is past start time
        // Allow completion after 2 minutes from the scheduled start time
        const twoMinutesAfterStart = new Date(eventStartDateTime.getTime() + 2 * 60 * 1000);
        
        if (now >= twoMinutesAfterStart) {
          return true;
        }
      }
      
      // Check if current time is past the end time (always allow completion)
      if (request.end_time) {
        const eventEndDateTime = new Date(request.event_date + 'T' + request.end_time);
        if (now >= eventEndDateTime) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Accept request (musician accepts a request)
  public acceptRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;

      // Only musicians can accept requests
      if (userRole !== 'musician') {
        res.status(403).json({
          success: false,
          message: 'Solo los músicos pueden aceptar solicitudes'
        });
        return;
      }

      // Check if request exists
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check if musician can accept request using database function
      const { data: canAccept, error: canAcceptError } = await supabase
        .rpc('can_musician_accept_request', { 
          request_id: requestId, 
          musician_id: userId 
        });

      if (canAcceptError || !canAccept) {
        res.status(400).json({
          success: false,
          message: 'No puedes aceptar esta solicitud en este momento'
        });
        return;
      }

      // Update request to mark as accepted
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          musician_status: 'accepted',
          accepted_by_musician_id: userId,
          musician_response_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        logger.error('Error accepting request:', updateError);
        res.status(500).json({
          success: false,
          message: 'Error al aceptar la solicitud'
        });
        return;
      }

      // Emit WebSocket event
      if (this.socketService) {
        this.socketService.emitToUser(request.leader_id, 'request_accepted', {
          request_id: requestId,
          musician_id: userId,
          accepted_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Solicitud aceptada exitosamente',
        data: {
          request_id: requestId,
          musician_status: 'accepted',
          accepted_at: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Accept request error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Reject request (musician rejects a request)
  public rejectRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;

      // Only musicians can reject requests
      if (userRole !== 'musician') {
        res.status(403).json({
          success: false,
          message: 'Solo los músicos pueden rechazar solicitudes'
        });
        return;
      }

      // Check if request exists
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check if musician can reject request using database function
      const { data: canReject, error: canRejectError } = await supabase
        .rpc('can_musician_reject_request', { 
          request_id: requestId, 
          musician_id: userId 
        });

      if (canRejectError || !canReject) {
        res.status(400).json({
          success: false,
          message: 'No puedes rechazar esta solicitud en este momento'
        });
        return;
      }

      // Update request to mark as rejected
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          musician_status: 'rejected',
          accepted_by_musician_id: userId,
          musician_response_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        logger.error('Error rejecting request:', updateError);
        res.status(500).json({
          success: false,
          message: 'Error al rechazar la solicitud'
        });
        return;
      }

      // Emit WebSocket event
      if (this.socketService) {
        this.socketService.emitToUser(request.leader_id, 'request_rejected', {
          request_id: requestId,
          musician_id: userId,
          rejected_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Solicitud rechazada exitosamente',
        data: {
          request_id: requestId,
          musician_status: 'rejected',
          rejected_at: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Reject request error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Get musician request status
  public getMusicianRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = (req as any).user.userId;

      // Get request details
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .single();

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check if musician can accept request
      const { data: canAccept } = await supabase
        .rpc('can_musician_accept_request', { 
          request_id: requestId, 
          musician_id: userId 
        });

      // Check if musician can reject request
      const { data: canReject } = await supabase
        .rpc('can_musician_reject_request', { 
          request_id: requestId, 
          musician_id: userId 
        });

      res.json({
        success: true,
        data: {
          request_id: requestId,
          musician_status: request.musician_status,
          accepted_by_musician_id: request.accepted_by_musician_id,
          musician_response_at: request.musician_response_at,
          can_accept: canAccept || false,
          can_reject: canReject || false,
          current_time: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Get musician request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  // Cancel request (leaders can cancel with penalties)
  public cancelRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: requestId } = req.params;
      const { reason } = req.body;
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.active_role || (req as any).user.role;

      logger.info(`cancelRequest: requestId=${req.params['id']}, userId=${userId}, userRole=${userRole}`);

      // Only leaders can cancel requests
      if (userRole !== 'leader') {
        res.status(403).json({
          success: false,
          message: 'Solo los líderes pueden cancelar solicitudes'
        });
        return;
      }

      logger.info(`cancelRequest: requestId before Supabase query = ${requestId}`);
      // Check if request exists and belongs to the leader
      const { data: request, error: requestError } = await supabase
        .from('requests')
        .select('*, leader:users!requests_leader_id_fkey(id, name, church_name, location)')
        .eq('id', requestId)
        .eq('leader_id', userId)
        .single();

      logger.info(`cancelRequest: requestError=${requestError?.message}, request=${request ? 'found' : 'not found'}`);

      if (requestError || !request) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Check if request can be cancelled
      if (request.status === 'cancelled') {
        res.status(400).json({
          success: false,
          message: 'La solicitud ya ha sido cancelada'
        });
        return;
      }

      if (request.status === 'completed') {
        res.status(400).json({
          success: false,
          message: 'No se puede cancelar una solicitud completada'
        });
        return;
      }

      // Calculate penalty based on time until event
      const now = new Date();
      const eventDateTime = new Date(request.event_date + 'T' + request.start_time);
      const timeUntilEvent = eventDateTime.getTime() - now.getTime();
      const hoursUntilEvent = timeUntilEvent / (1000 * 60 * 60);

      let penaltyPercentage = 0;
      let penaltyReason = '';

      if (hoursUntilEvent < 24) {
        penaltyPercentage = 50; // 50% penalty if less than 24 hours
        penaltyReason = 'Cancelación con menos de 24 horas de anticipación';
      } else if (hoursUntilEvent < 48) {
        penaltyPercentage = 25; // 25% penalty if less than 48 hours
        penaltyReason = 'Cancelación con menos de 48 horas de anticipación';
      } else {
        penaltyPercentage = 0; // No penalty if more than 48 hours
        penaltyReason = 'Cancelación con más de 48 horas de anticipación';
      }

      // Update request to mark as cancelled
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          status: 'cancelled',
          event_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        logger.error('Error cancelling request:', updateError);
        res.status(500).json({
          success: false,
          message: 'Error al cancelar la solicitud'
        });
        return;
      }

      // Emit WebSocket event to notify musicians
      if (this.socketService) {
        this.socketService.emitToUser(request.leader_id, 'request_cancelled', {
          request_id: requestId,
          reason: reason,
          penalty_percentage: penaltyPercentage,
          penalty_reason: penaltyReason,
          cancelled_at: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Solicitud cancelada exitosamente',
        data: {
          request_id: requestId,
          status: 'cancelled',
          penalty_percentage: penaltyPercentage,
          penalty_reason: penaltyReason,
          cancelled_at: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Cancel request error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}

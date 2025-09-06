import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import supabase from '../config/database';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:8081",
          "http://localhost:19006",
          "http://localhost:19000",
          "http://172.20.10.4:3000",
          "http://172.20.10.4:8081",
          "http://172.20.10.4:19006",
          "http://172.20.10.4:19000"
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', (userId: string) => {
        this.connectedUsers.set(userId, socket.id);
        socket.join(`user_${userId}`);
        console.log(`User ${userId} authenticated with socket ${socket.id}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from connected users
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            break;
          }
        }
      });
    });
  }

  // Notify all musicians about a new request
  public async notifyNewRequest(request: any) {
    try {
      // Get all musicians
      const { data: musicians, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'musician')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching musicians:', error);
        return;
      }

      // Send notification to all musicians
      musicians?.forEach((musician: any) => {
        this.io.to(`user_${musician.id}`).emit('new_request', {
          type: 'new_request',
          data: request,
          message: `Nueva solicitud: ${request.event_type} - ${request.location}`,
          timestamp: new Date().toISOString()
        });
      });

      console.log(`Notified ${musicians?.length || 0} musicians about new request`);
    } catch (error) {
      console.error('Error notifying musicians:', error);
    }
  }

  // Notify specific user about offer selection
  public notifyOfferSelected(musicianId: string, offer: any) {
    this.io.to(`user_${musicianId}`).emit('offer_selected', {
      type: 'offer_selected',
      data: offer,
      message: `Tu oferta ha sido seleccionada!`,
      timestamp: new Date().toISOString()
    });
  }

  // Notify leader about new offer
  public notifyNewOffer(leaderId: string, offer: any) {
    this.io.to(`user_${leaderId}`).emit('new_offer', {
      type: 'new_offer',
      data: offer,
      message: `Nueva oferta recibida para tu solicitud`,
      timestamp: new Date().toISOString()
    });
  }

  // Notify user about request update
  public notifyRequestUpdate(userId: string, request: any) {
    this.io.to(`user_${userId}`).emit('request_updated', {
      type: 'request_updated',
      data: request,
      message: `Solicitud actualizada`,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Emit event to specific user
  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }
}

export let socketService: SocketService;

export const initializeSocketService = (server: HTTPServer) => {
  socketService = new SocketService(server);
  return socketService;
};

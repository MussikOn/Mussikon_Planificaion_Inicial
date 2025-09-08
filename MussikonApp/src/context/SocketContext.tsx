import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Platform, Alert } from 'react-native';
import { audioService } from '../services/audioService';
import { URL_SERVER } from '../config/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationData[];
  unreadCount: number;
  playNotificationSound: () => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

interface NotificationData {
  id: string;
  type: string;
  message: string;
  data: any;
  timestamp: string;
  read: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Configure notification permissions and load audio
  useEffect(() => {
    console.log('Socket context initialized');
    
    // Load the notification sound when context initializes
    const loadAudio = async () => {
      try {
        await audioService.loadNotificationSound();
        console.log('Notification sound loaded successfully');
      } catch (error) {
        console.error('Error loading notification sound:', error);
      }
    };
    
    loadAudio();
    
    // Cleanup audio when component unmounts
    return () => {
      audioService.unloadSound();
    };
  }, []);

  // Initialize socket connection
  const UelServer = URL_SERVER;
  useEffect(() => {
    if (user && token) {
      const newSocket = io(URL_SERVER, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        
        // Authenticate with user ID
        newSocket.emit('authenticate', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Listen for new request notifications
      newSocket.on('new_request', (data) => {
        console.log('New request notification:', data);
        addNotification({
          id: `new_request_${Date.now()}`,
          type: 'new_request',
          message: data.message,
          data: data.data,
          timestamp: data.timestamp,
          read: false
        });
        // Play Steven Universe notification sound
        audioService.playNewRequestSound();
        showLocalNotification('Nueva Solicitud', data.message);
      });

      // Listen for new offer notifications
      newSocket.on('new_offer', (data) => {
        console.log('New offer notification:', data);
        addNotification({
          id: `new_offer_${Date.now()}`,
          type: 'new_offer',
          message: data.message,
          data: data.data,
          timestamp: data.timestamp,
          read: false
        });
        // Play notification sound for offers
        audioService.playNewOfferSound();
        showLocalNotification('Nueva Oferta', data.message);
      });

      // Listen for offer selected notifications
      newSocket.on('offer_selected', (data) => {
        console.log('Offer selected notification:', data);
        addNotification({
          id: `offer_selected_${Date.now()}`,
          type: 'offer_selected',
          message: data.message,
          data: data.data,
          timestamp: data.timestamp,
          read: false
        });
        // Play notification sound for offer selection
        audioService.playOfferSelectedSound();
        showLocalNotification('Oferta Seleccionada', data.message);
      });

      // Listen for request update notifications
      newSocket.on('request_updated', (data) => {
        console.log('Request updated notification:', data);
        addNotification({
          id: `request_updated_${Date.now()}`,
          type: 'request_updated',
          message: data.message,
          data: data.data,
          timestamp: data.timestamp,
          read: false
        });
        playNotificationSound();
        showLocalNotification('Solicitud Actualizada', data.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  const playNotificationSound = () => {
    // Use the audio service for consistent sound across platforms
    audioService.playNotificationSound();
  };

  const showLocalNotification = async (title: string, body: string) => {
    // Show simple alert for now
    if (Platform.OS !== 'web') {
      Alert.alert(title, body);
    } else {
      // For web, show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: SocketContextType = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    playNotificationSound,
    markAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

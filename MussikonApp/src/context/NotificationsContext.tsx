import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (type: Notification['type'], title: string, message: string, data?: any) => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (token && user) {
      // Start polling for notifications
      notificationService.startPolling(token);
      
      // Subscribe to notification updates
      const unsubscribe = notificationService.subscribe((newNotifications) => {
        setNotifications(newNotifications);
      });

      return () => {
        unsubscribe();
        notificationService.stopPolling();
      };
    } else {
      notificationService.stopPolling();
      setNotifications([]);
    }
  }, [token, user]);

  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      await notificationService.fetchNotifications(token);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) return;
    
    try {
      await notificationService.markAsRead(notificationId, token);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          notificationService.markAsRead(notification.id, token)
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = (type: Notification['type'], title: string, message: string, data?: any) => {
    notificationService.createLocalNotification(type, title, message, data);
  };

  const clearNotifications = () => {
    notificationService.clear();
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
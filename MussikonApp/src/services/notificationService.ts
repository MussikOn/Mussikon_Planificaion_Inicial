import { Platform } from 'react-native';
import { apiService } from './api';

export interface Notification {
  id: string;
  type: 'offer_received' | 'offer_selected' | 'offer_rejected' | 'request_cancelled' | 'request_completed' | 'musician_approved' | 'musician_rejected';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

class NotificationService {
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private notifications: Notification[] = [];
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Start polling for notifications
  startPolling(token: string, intervalMs: number = 30000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        await this.fetchNotifications(token);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }, intervalMs);

    // Fetch immediately
    this.fetchNotifications(token);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Fetch notifications from API
  async fetchNotifications(token: string) {
    try {
      const response = await apiService.getNotifications(token);
      if (response.success) {
        this.notifications = response.data;
        this.notifyListeners();
      } else {
        console.error('Failed to fetch notifications: Unknown error');
        // Return empty array instead of throwing error
        this.notifications = [];
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty array instead of throwing error
      this.notifications = [];
      this.notifyListeners();
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, token: string) {
    try {
      const response = await apiService.markNotificationAsRead(notificationId, token);
      if (response.success) {
        this.notifications = this.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Create local notification (for immediate feedback)
  createLocalNotification(type: Notification['type'], title: string, message: string, data?: any) {
    const notification: Notification = {
      id: `local_${Date.now()}`,
      type,
      title,
      message,
      data,
      read: false,
      created_at: new Date().toISOString()
    };

    this.notifications.unshift(notification);
    this.notifyListeners();

    // Show platform-specific notification
    this.showPlatformNotification(title, message);
  }

  // Show platform-specific notification
  private showPlatformNotification(title: string, message: string) {
    if (Platform.OS === 'web') {
      // Web notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    } else {
      // React Native notifications
      // TODO: Implement with react-native-push-notification or expo-notifications
      console.log('Notification:', title, message);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } else {
      // React Native permission request
      // TODO: Implement with react-native-push-notification or expo-notifications
      return true;
    }
  }

  // Clear all notifications
  clear() {
    this.notifications = [];
    this.notifyListeners();
  }
}

export const notificationService = new NotificationService();
export default notificationService;

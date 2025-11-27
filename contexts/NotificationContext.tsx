import React, { createContext, useContext, useEffect, useState } from 'react';
import NotificationService from '../services/NotificationService';
import { useAuth } from './AuthContext';

interface NotificationData {
  id: string;
  type: 'feedback' | 'training' | 'general';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read?: boolean;
}

interface NotificationContextData {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  testNotification: () => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user, userType } = useAuth();

  useEffect(() => {
    if (user && userType) {
      // Conectar ao serviço de notificações
      connectToNotifications();
      
      // Carregar notificações salvas
      loadLocalNotifications();
    } else {
      // Desconectar se não houver usuário
      NotificationService.disconnect();
      setIsConnected(false);
    }

    return () => {
      NotificationService.disconnect();
    };
  }, [user, userType]);

  const connectToNotifications = async () => {
    try {
      await NotificationService.connect();
      setIsConnected(NotificationService.isSocketConnected());
      
      // Verificar conexão periodicamente
      const interval = setInterval(() => {
        setIsConnected(NotificationService.isSocketConnected());
      }, 5000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Erro ao conectar notificações:', error);
    }
  };

  const loadLocalNotifications = async () => {
    try {
      const localNotifications = await NotificationService.getLocalNotifications();
      setNotifications(localNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações locais:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await loadLocalNotifications(); // Recarregar para atualizar o estado
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const refreshNotifications = async () => {
    await loadLocalNotifications();
  };

  const testNotification = () => {
    NotificationService.testNotification();
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        refreshNotifications,
        testNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }

  return context;
}

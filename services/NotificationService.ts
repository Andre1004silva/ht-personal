import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ENV } from '../config/env';

interface NotificationData {
  id: string;
  type: 'feedback' | 'training' | 'general';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private userId: number | null = null;
  private userType: 'personal' | 'aluno' | null = null;
  private pushToken: string | null = null;

  constructor() {
    this.setupNotifications();
  }

  /**
   * Configura as notificações push
   */
  private async setupNotifications() {
    // Configurar comportamento das notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Solicitar permissões e obter token
    const hasPermission = await this.requestPermissions();
    if (hasPermission) {
      await this.registerForPushNotifications();
    }
  }

  /**
   * Solicita permissões para notificações
   */
  private async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return false;
    }

    return true;
  }

  /**
   * Registra para receber push notifications
   */
  private async registerForPushNotifications() {
    try {
      // Obter token de push notification
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Token de push obtido:', token);

      // Salvar token localmente
      await AsyncStorage.setItem('@HighTraining:pushToken', token);

      // Registrar token no servidor quando conectar
      this.pushToken = token;
      
      return token;
    } catch (error) {
      console.error('Erro ao obter token de push:', error);
      return null;
    }
  }

  /**
   * Conecta ao WebSocket
   */
  async connect() {
    try {
      // Recuperar dados do usuário
      const storedUser = await AsyncStorage.getItem('@HighTraining:user');
      const storedUserType = await AsyncStorage.getItem('@HighTraining:userType');

      if (!storedUser || !storedUserType) {
        console.log('Usuário não encontrado no storage');
        return;
      }

      const user = JSON.parse(storedUser);
      this.userId = user.id;
      this.userType = storedUserType as 'personal' | 'aluno';

      // Conectar ao socket
      this.socket = io(ENV.API_URL, {
        transports: ['websocket'],
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Conectado ao WebSocket');
        this.isConnected = true;
        this.registerUser();
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Desconectado do WebSocket');
        this.isConnected = false;
      });

      this.socket.on('registered', (data: any) => {
        console.log('✅ Registrado no WebSocket:', data);
        // Registrar token de push no servidor após conectar
        this.registerPushTokenOnServer();
      });

      this.socket.on('notification', (notification: NotificationData) => {
        console.log('📱 Notificação recebida:', notification);
        this.handleNotification(notification);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ Erro de conexão WebSocket:', error);
      });

    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
    }
  }

  /**
   * Registra o usuário no WebSocket
   */
  private registerUser() {
    if (!this.socket || !this.userId || !this.userType) return;

    if (this.userType === 'personal') {
      this.socket.emit('register_personal', this.userId);
    } else {
      this.socket.emit('register_aluno', this.userId);
    }
  }

  /**
   * Registra token de push no servidor
   */
  private async registerPushTokenOnServer() {
    if (!this.pushToken || !this.userId || !this.userType) {
      console.log('Dados insuficientes para registrar token de push');
      return;
    }

    try {
      const { api } = await import('../contexts/AuthContext');
      
      const mappedType = this.userType === 'personal' ? 'trainer' : 'student';
      await api.post('/notifications/register-token', {
        userId: this.userId,
        userType: mappedType,
        pushToken: this.pushToken
      });

      console.log('✅ Token de push registrado no servidor');
    } catch (error) {
      console.error('Erro ao registrar token de push no servidor:', error);
    }
  }

  /**
   * Processa notificação recebida
   */
  private async handleNotification(notification: NotificationData) {
    // Mostrar notificação push
    await this.showPushNotification(notification);

    // Salvar notificação localmente (opcional)
    await this.saveNotificationLocally(notification);
  }

  /**
   * Mostra notificação push
   */
  private async showPushNotification(notification: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: notification.data,
          sound: true,
        },
        trigger: null, // Mostrar imediatamente
      });
    } catch (error) {
      console.error('Erro ao mostrar notificação push:', error);
    }
  }

  /**
   * Salva notificação localmente
   */
  private async saveNotificationLocally(notification: NotificationData) {
    try {
      const existingNotifications = await AsyncStorage.getItem('@HighTraining:notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      
      notifications.unshift(notification);
      
      // Manter apenas as últimas 50 notificações
      if (notifications.length > 50) {
        notifications.splice(50);
      }

      await AsyncStorage.setItem('@HighTraining:notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Erro ao salvar notificação localmente:', error);
    }
  }

  /**
   * Recupera notificações salvas localmente
   */
  async getLocalNotifications(): Promise<NotificationData[]> {
    try {
      const notifications = await AsyncStorage.getItem('@HighTraining:notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Erro ao recuperar notificações locais:', error);
      return [];
    }
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string) {
    try {
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      await AsyncStorage.setItem('@HighTraining:notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Envia teste de notificação (apenas para desenvolvimento)
   */
  testNotification() {
    if (this.socket && this.isConnected && this.userId) {
      this.socket.emit('test_notification', { treinadorId: this.userId });
    }
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Verifica se está conectado
   */
  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export default new NotificationService();

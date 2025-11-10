import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENV } from '../config/env';

const API_URL = ENV.API_URL;

// Configura axios
const api = axios.create({
  baseURL: API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Exporta a instância do axios para uso em outras partes do app
export { api };

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  admin_id?: number;
  treinador_id?: number;
  document?: string;
  position?: string;
}

interface AuthContextData {
  user: User | null;
  userType: 'personal' | 'aluno' | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string, userType: 'personal' | 'aluno') => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  userType: 'personal' | 'aluno';
  document?: string;
  position?: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'personal' | 'aluno' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedToken = await AsyncStorage.getItem('@HighTraining:token');
      const storedUser = await AsyncStorage.getItem('@HighTraining:user');
      const storedUserType = await AsyncStorage.getItem('@HighTraining:userType');

      if (storedToken && storedUser && storedUserType) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setUserType(storedUserType as 'personal' | 'aluno');

        // Valida o token
        try {
          await api.get('/sessions/validate', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });
        } catch (error) {
          // Se o token for inválido, limpa os dados
          await signOut();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do storage:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string, userTypeParam: 'personal' | 'aluno') {
    try {
      const response = await api.post('/sessions/login', {
        email,
        password,
        userType: userTypeParam,
      });

      const data = response.data;

      setUser(data.user);
      setUserType(data.userType);
      setToken(data.token);

      await AsyncStorage.setItem('@HighTraining:token', data.token);
      await AsyncStorage.setItem('@HighTraining:user', JSON.stringify(data.user));
      await AsyncStorage.setItem('@HighTraining:userType', data.userType);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao fazer login';
      throw new Error(message);
    }
  }

  async function signUp(data: SignUpData) {
    try {
      const response = await api.post('/sessions/register', data);

      const responseData = response.data;

      setUser(responseData.user);
      setUserType(responseData.userType);
      setToken(responseData.token);

      await AsyncStorage.setItem('@HighTraining:token', responseData.token);
      await AsyncStorage.setItem('@HighTraining:user', JSON.stringify(responseData.user));
      await AsyncStorage.setItem('@HighTraining:userType', responseData.userType);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Erro ao criar conta';
      throw new Error(message);
    }
  }

  async function signOut() {
    setUser(null);
    setUserType(null);
    setToken(null);

    await AsyncStorage.removeItem('@HighTraining:token');
    await AsyncStorage.removeItem('@HighTraining:user');
    await AsyncStorage.removeItem('@HighTraining:userType');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        token,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}

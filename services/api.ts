import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';

// Cria instância do axios com configurações base
const api: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições (adicionar token, logs, etc)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adiciona admin_id no header (obrigatório para a API)
    // TODO: Substituir por autenticação real quando implementar login
    config.headers['admin_id'] = '1';
    
    // Aqui você pode adicionar token de autenticação
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('[API Request Data]', config.data);
    console.log('[API Request Headers]', config.headers);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas (tratamento de erros, logs, etc)
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Erro de resposta do servidor
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Tratamento de erros específicos
      switch (error.response.status) {
        case 401:
          // Token inválido ou expirado
          console.log('Não autorizado - redirecionando para login');
          // Aqui você pode redirecionar para tela de login
          break;
        case 404:
          console.log('Recurso não encontrado');
          break;
        case 500:
          console.log('Erro interno do servidor');
          break;
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('[API No Response]', error.request);
    } else {
      // Erro ao configurar a requisição
      console.error('[API Setup Error]', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

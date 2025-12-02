import api from './api';

export interface ClientePhoto {
  id: number;
  cliente_id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  is_profile: boolean;
  created_at: string;
  updated_at: string;
}

class ClientePhotosService {
  /**
   * Upload de foto de perfil do cliente
   */
  async uploadProfilePhoto(clienteId: number, formData: FormData): Promise<ClientePhoto> {
    try {
      const response = await api.post<ClientePhoto>(
        `/clientes/${clienteId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer upload da foto do cliente ${clienteId}:`, error);
      throw error;
    }
  }

  /**
   * Obter informações da foto de perfil do cliente
   */
  async getProfilePhoto(clienteId: number): Promise<ClientePhoto> {
    try {
      const response = await api.get<ClientePhoto>(`/clientes/${clienteId}/photo`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar foto do cliente ${clienteId}:`, error);
      throw error;
    }
  }

  /**
   * Obter URL para download da foto de perfil
   */
  getProfilePhotoUrl(clienteId: number): string {
    return `${api.defaults.baseURL}/clientes/${clienteId}/photo/file`;
  }

  /**
   * Deletar foto de perfil do cliente
   */
  async deleteProfilePhoto(clienteId: number): Promise<void> {
    try {
      await api.delete(`/clientes/${clienteId}/photo`);
    } catch (error) {
      console.error(`Erro ao deletar foto do cliente ${clienteId}:`, error);
      throw error;
    }
  }
}

export default new ClientePhotosService();

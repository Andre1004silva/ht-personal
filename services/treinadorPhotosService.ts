import api from './api';

export interface TreinadorPhoto {
  id: number;
  treinador_id: number;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  is_profile: boolean;
  created_at: string;
  updated_at: string;
}

class TreinadorPhotosService {
  /**
   * Upload de foto de perfil do treinador
   */
  async uploadProfilePhoto(treinadorId: number, formData: FormData): Promise<TreinadorPhoto> {
    try {
      const response = await api.post<TreinadorPhoto>(
        `/treinadores/${treinadorId}/photo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer upload da foto do treinador ${treinadorId}:`, error);
      throw error;
    }
  }

  /**
   * Obter informações da foto de perfil do treinador
   */
  async getProfilePhoto(treinadorId: number): Promise<TreinadorPhoto> {
    try {
      const response = await api.get<TreinadorPhoto>(`/treinadores/${treinadorId}/photo`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar foto do treinador ${treinadorId}:`, error);
      throw error;
    }
  }

  /**
   * Obter URL para download da foto de perfil
   */
  getProfilePhotoUrl(treinadorId: number): string {
    return `${api.defaults.baseURL}/treinadores/${treinadorId}/photo/file`;
  }

  /**
   * Deletar foto de perfil do treinador
   */
  async deleteProfilePhoto(treinadorId: number): Promise<void> {
    try {
      await api.delete(`/treinadores/${treinadorId}/photo`);
    } catch (error) {
      console.error(`Erro ao deletar foto do treinador ${treinadorId}:`, error);
      throw error;
    }
  }
}

export default new TreinadorPhotosService();

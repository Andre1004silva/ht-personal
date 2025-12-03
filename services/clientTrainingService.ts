import api from './api';

export interface ClientTraining {
  id?: number;
  admin_id?: number;
  treinador_id?: number;
  client_id: number;
  training_id: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Dados relacionados (joins)
  cliente_name?: string;
  training_name?: string;
  treinador_name?: string;
}

export interface CreateClientTrainingPayload {
  client_id: number;
  training_id: number;
  notes?: string;
  treinador_id?: number;
}

export interface UpdateClientTrainingPayload {
  notes?: string;
  treinador_id?: number;
}

class ClientTrainingService {
  /**
   * Busca todos os treinos atribuídos
   */
  async getAll(filters?: {
    client_id?: number;
    training_id?: number;
    treinador_id?: number;
  }): Promise<ClientTraining[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.client_id) params.append('client_id', filters.client_id.toString());
      if (filters?.training_id) params.append('training_id', filters.training_id.toString());
      if (filters?.treinador_id) params.append('treinador_id', filters.treinador_id.toString());

      const url = params.toString() ? `/client-training?${params.toString()}` : '/client-training';
      const response = await api.get<ClientTraining[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar treinos atribuídos:', error);
      throw error;
    }
  }

  /**
   * Busca treinos atribuídos a um cliente específico
   */
  async getByClientId(clientId: number): Promise<ClientTraining[]> {
    return this.getAll({ client_id: clientId });
  }

  /**
   * Busca uma atribuição específica por ID
   */
  async getById(id: number): Promise<ClientTraining> {
    try {
      const response = await api.get<ClientTraining>(`/client-training/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar atribuição ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria uma nova atribuição de treino
   */
  async create(payload: CreateClientTrainingPayload): Promise<ClientTraining> {
    try {
      console.log('[ClientTrainingService] Criando atribuição:', payload);
      const response = await api.post<ClientTraining>('/client-training', payload);
      console.log('[ClientTrainingService] Atribuição criada com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar atribuição de treino:', error);
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  }

  /**
   * Atualiza uma atribuição existente
   */
  async update(id: number, payload: UpdateClientTrainingPayload): Promise<{ message: string; clientTraining: ClientTraining }> {
    try {
      console.log('[ClientTrainingService] Atualizando atribuição:', id, payload);
      const response = await api.put<{ message: string; clientTraining: ClientTraining }>(`/client-training/${id}`, payload);
      console.log('[ClientTrainingService] Atribuição atualizada com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao atualizar atribuição ${id}:`, error);
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  }

  /**
   * Deleta uma atribuição
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/client-training/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar atribuição ${id}:`, error);
      throw error;
    }
  }
}

export default new ClientTrainingService();

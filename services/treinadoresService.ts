import api from './api';

export interface Treinador {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  cref?: string;
  foto?: string;
  bio?: string;
  experiencia_anos?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TreinadorResponse {
  data: Treinador[];
  total?: number;
}

class TreinadoresService {
  /**
   * Busca todos os treinadores
   */
  async getAll(): Promise<Treinador[]> {
    try {
      const response = await api.get<Treinador[]>('/treinadores');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar treinadores:', error);
      throw error;
    }
  }

  /**
   * Busca um treinador específico por ID
   */
  async getById(id: number): Promise<Treinador> {
    try {
      const response = await api.get<Treinador>(`/treinadores/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar treinador ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo treinador
   */
  async create(treinador: Omit<Treinador, 'id' | 'created_at' | 'updated_at'>): Promise<Treinador> {
    try {
      const response = await api.post<Treinador>('/treinadores', treinador);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar treinador:', error);
      throw error;
    }
  }

  /**
   * Atualiza um treinador existente
   */
  async update(id: number, treinador: Partial<Treinador>): Promise<Treinador> {
    try {
      const response = await api.put<Treinador>(`/treinadores/${id}`, treinador);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar treinador ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um treinador
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/treinadores/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar treinador ${id}:`, error);
      throw error;
    }
  }
}

export default new TreinadoresService();

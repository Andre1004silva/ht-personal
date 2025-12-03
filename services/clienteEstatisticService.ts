import api from './api';

export interface ClienteEstatistic {
  id?: number;
  admin_id?: number;
  cliente_id: number;
  weight?: string | number;
  height?: string | number;
  muscle_mass_percentage?: string | number;
  notes?: string;
  // Medidas corporais
  ombro?: string | number;
  torax?: string | number;
  braco_esquerdo?: string | number;
  braco_direito?: string | number;
  antebraco_esquerdo?: string | number;
  antebraco_direito?: string | number;
  punho?: string | number;
  cintura?: string | number;
  abdome?: string | number;
  quadril?: string | number;
  coxa_esquerda?: string | number;
  coxa_direita?: string | number;
  panturrilha_esquerda?: string | number;
  panturrilha_direita?: string | number;
  created_at?: string;
  updated_at?: string;
  cliente_name?: string;
}

export interface MedidaCorporal {
  id: number;
  data: string;
  medidas: {
    ombro?: number;
    torax?: number;
    bracos: {
      esquerdo?: number;
      direito?: number;
    };
    antebracos: {
      esquerdo?: number;
      direito?: number;
    };
    punho?: number;
    cintura?: number;
    abdome?: number;
    quadril?: number;
    coxas: {
      esquerda?: number;
      direita?: number;
    };
    panturrilhas: {
      esquerda?: number;
      direita?: number;
    };
  };
}

export interface MedidasResponse {
  medidas: MedidaCorporal[];
}

class ClienteEstatisticService {
  /**
   * Busca todas as estatísticas de clientes
   */
  async getAll(filters?: { cliente_id?: number }): Promise<ClienteEstatistic[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.cliente_id) params.append('cliente_id', filters.cliente_id.toString());

      const url = params.toString() ? `/cliente-estatistic?${params.toString()}` : '/cliente-estatistic';
      const response = await api.get<ClienteEstatistic[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca uma estatística específica por ID
   */
  async getById(id: number): Promise<ClienteEstatistic> {
    try {
      const response = await api.get<ClienteEstatistic>(`/cliente-estatistic/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar estatística ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca a última estatística de um cliente
   */
  async getLatest(clienteId: number): Promise<ClienteEstatistic> {
    try {
      const response = await api.get<ClienteEstatistic>(`/cliente-estatistic/latest/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar última estatística do cliente ${clienteId}:`, error);
      throw error;
    }
  }

  /**
   * Busca as medidas corporais de um cliente
   */
  async getMedidas(clienteId: number): Promise<MedidasResponse> {
    try {
      const response = await api.get<MedidasResponse>(`/cliente-estatistic/medidas/${clienteId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar medidas do cliente ${clienteId}:`, error);
      throw error;
    }
  }

  /**
   * Cria uma nova estatística
   */
  async create(estatistica: Omit<ClienteEstatistic, 'id' | 'created_at' | 'updated_at' | 'cliente_name'>): Promise<ClienteEstatistic> {
    try {
      const response = await api.post<ClienteEstatistic>('/cliente-estatistic', estatistica);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar estatística:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma estatística existente
   */
  async update(id: number, estatistica: Partial<ClienteEstatistic>): Promise<{ message: string; estatistic: ClienteEstatistic }> {
    try {
      const response = await api.put<{ message: string; estatistic: ClienteEstatistic }>(`/cliente-estatistic/${id}`, estatistica);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar estatística ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta uma estatística
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/cliente-estatistic/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar estatística ${id}:`, error);
      throw error;
    }
  }
}

export default new ClienteEstatisticService();

import api from './api';

export interface ClienteEstatistic {
  id?: number;
  admin_id?: number;
  student_id: number;
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
  student_name?: string;
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
  private normalizeToPt(stat: any): ClienteEstatistic {
    if (!stat) return stat;
    return {
      id: stat.id,
      admin_id: stat.admin_id,
      student_id: stat.student_id,
      weight: stat.weight,
      height: stat.height,
      muscle_mass_percentage: stat.muscle_mass_percentage,
      notes: stat.notes,
      ombro: stat.shoulder,
      torax: stat.chest,
      braco_esquerdo: stat.left_arm,
      braco_direito: stat.right_arm,
      antebraco_esquerdo: stat.left_forearm,
      antebraco_direito: stat.right_forearm,
      punho: stat.wrist,
      cintura: stat.waist,
      abdome: stat.abdomen,
      quadril: stat.hip,
      coxa_esquerda: stat.left_thigh,
      coxa_direita: stat.right_thigh,
      panturrilha_esquerda: stat.left_calf,
      panturrilha_direita: stat.right_calf,
      created_at: stat.created_at,
      updated_at: stat.updated_at,
      student_name: stat.student_name,
    };
  }
  /**
   * Busca todas as estatísticas de clientes
   */
  async getAll(filters?: { student_id?: number }): Promise<ClienteEstatistic[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.student_id) params.append('student_id', filters.student_id.toString());

      const url = params.toString() ? `/student-statistics?${params.toString()}` : '/student-statistics';
      const response = await api.get<any[]>(url);
      return response.data.map(s => this.normalizeToPt(s));
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
      const response = await api.get<any>(`/student-statistics/${id}`);
      return this.normalizeToPt(response.data);
    } catch (error) {
      console.error(`Erro ao buscar estatística ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca a última estatística de um cliente
   */
  async getLatest(studentId: number): Promise<ClienteEstatistic> {
    try {
      const response = await api.get<any>(`/student-statistics/latest/${studentId}`);
      return this.normalizeToPt(response.data);
    } catch (error) {
      console.error(`Erro ao buscar última estatística do aluno ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Busca as medidas corporais de um cliente
   */
  async getMedidas(studentId: number): Promise<MedidasResponse> {
    try {
      const response = await api.get<MedidasResponse>(`/student-statistics/measures/${studentId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar medidas do cliente ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Cria uma nova estatística
   */
  async create(estatistica: Omit<ClienteEstatistic, 'id' | 'created_at' | 'updated_at' | 'student_name'>): Promise<ClienteEstatistic> {
    try {
      const response = await api.post<ClienteEstatistic>('/student-statistics', estatistica);
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
      const response = await api.put<{ message: string; estatistic: ClienteEstatistic }>(`/student-statistics/${id}`, estatistica);
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
      const response = await api.delete<{ message: string }>(`/student-statistics/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar estatística ${id}:`, error);
      throw error;
    }
  }
}

export default new ClienteEstatisticService();

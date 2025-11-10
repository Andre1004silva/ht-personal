import api from './api';

export interface Training {
  id?: number;
  admin_id?: number;
  treinador_id?: number;
  name: string; // Backend usa 'name'
  nome?: string; // Alias para compatibilidade
  duration?: string; // Backend usa 'duration' como string
  duracao?: number; // Alias para compatibilidade (number)
  repeticoes?: string;
  video_url?: string;
  carga?: string;
  notes?: string;
  treinador_name?: string;
  // Campos legados do frontend (não existem no backend)
  descricao?: string;
  tipo?: string;
  nivel?: 'Iniciante' | 'Intermediário' | 'Avançado';
  objetivo?: string;
  frequencia_semanal?: number;
  observacoes?: string;
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingResponse {
  data: Training[];
  total?: number;
}

class TrainingsService {
  /**
   * Normaliza os dados do treino para compatibilidade
   */
  private normalizeTraining(training: any): Training {
    return {
      ...training,
      nome: training.name || training.nome,
      duracao: training.duration ? parseInt(training.duration) : training.duracao,
      descricao: training.notes || training.descricao,
      observacoes: training.notes || training.observacoes,
    };
  }

  /**
   * Busca todos os treinos
   */
  async getAll(): Promise<Training[]> {
    try {
      const response = await api.get<Training[]>('/trainings');
      return response.data.map(t => this.normalizeTraining(t));
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      throw error;
    }
  }

  /**
   * Busca um treino específico por ID
   */
  async getById(id: number): Promise<Training> {
    try {
      const response = await api.get<Training>(`/trainings/${id}`);
      return this.normalizeTraining(response.data);
    } catch (error) {
      console.error(`Erro ao buscar treino ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo treino
   */
  async create(training: Omit<Training, 'id' | 'created_at' | 'updated_at'>): Promise<Training> {
    try {
      // Converte para o formato do backend
      const payload = {
        name: training.name || training.nome,
        duration: training.duration || (training.duracao ? String(training.duracao) : undefined),
        repeticoes: training.repeticoes,
        video_url: training.video_url,
        carga: training.carga,
        notes: training.notes || training.descricao || training.observacoes,
        treinador_id: training.treinador_id,
      };
      const response = await api.post<Training>('/trainings', payload);
      return this.normalizeTraining(response.data);
    } catch (error) {
      console.error('Erro ao criar treino:', error);
      throw error;
    }
  }

  /**
   * Atualiza um treino existente
   */
  async update(id: number, training: Partial<Training>): Promise<Training> {
    try {
      // Converte para o formato do backend
      const payload: any = {};
      if (training.name || training.nome) payload.name = training.name || training.nome;
      if (training.duration || training.duracao) payload.duration = training.duration || (training.duracao ? String(training.duracao) : undefined);
      if (training.repeticoes !== undefined) payload.repeticoes = training.repeticoes;
      if (training.video_url !== undefined) payload.video_url = training.video_url;
      if (training.carga !== undefined) payload.carga = training.carga;
      if (training.notes || training.descricao || training.observacoes) payload.notes = training.notes || training.descricao || training.observacoes;
      if (training.treinador_id !== undefined) payload.treinador_id = training.treinador_id;
      
      const response = await api.put<Training>(`/trainings/${id}`, payload);
      return this.normalizeTraining(response.data);
    } catch (error) {
      console.error(`Erro ao atualizar treino ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um treino
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/trainings/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar treino ${id}:`, error);
      throw error;
    }
  }
}

export default new TrainingsService();

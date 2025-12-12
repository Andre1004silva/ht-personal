import api from './api';

export interface ExerciseTraining {
  id?: number;
  admin_id?: number;
  training_id: number;
  exercise_id: number;
  video_url?: string;
  sets?: number;
  reps?: number;
  rest_time?: number;
  order?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Dados relacionados (joins)
  training_name?: string;
  exercise_name?: string;
  repetitions?: string;
  series?: string;
  carga?: string;
  exercise_notes?: string;
  // Presets da biblioteca
  rep_type?: 'reps-load' | 'reps-load-time' | 'complete-set' | 'reps-time';
  default_load?: number;
  default_set?: number;
  default_reps?: number;
  default_time?: number;
  default_rest?: number;
}

export interface CreateExerciseTrainingPayload {
  training_id: number;
  exercise_id: number;
  video_url?: string;
  sets?: number;
  reps?: number;
  rest_time?: number;
  order?: number;
  notes?: string;
  rep_type?: 'reps-load' | 'reps-load-time' | 'complete-set' | 'reps-time';
  default_load?: number;
  default_set?: number;
  default_reps?: number;
  default_time?: number;
  default_rest?: number;
}

export interface UpdateExerciseTrainingPayload {
  video_url?: string;
  sets?: number;
  reps?: number;
  rest_time?: number;
  order?: number;
  notes?: string;
}

class ExerciseTrainingsService {
  /**
   * Busca todos os vínculos exercício-treino
   */
  async getAll(filters?: {
    training_id?: number;
    exercise_id?: number;
  }): Promise<ExerciseTraining[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.training_id) params.append('training_id', filters.training_id.toString());
      if (filters?.exercise_id) params.append('exercise_id', filters.exercise_id.toString());

      const url = params.toString() ? `/exercise-trainings?${params.toString()}` : '/exercise-trainings';
      const response = await api.get<ExerciseTraining[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vínculos exercício-treino:', error);
      throw error;
    }
  }

  /**
   * Busca exercícios de um treino específico
   */
  async getByTrainingId(trainingId: number): Promise<ExerciseTraining[]> {
    try {
      const response = await api.get<ExerciseTraining[]>(`/exercise-trainings/training/${trainingId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar exercícios do treino ${trainingId}:`, error);
      throw error;
    }
  }

  /**
   * Busca um vínculo específico por ID
   */
  async getById(id: number): Promise<ExerciseTraining> {
    try {
      const response = await api.get<ExerciseTraining>(`/exercise-trainings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vínculo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo vínculo exercício-treino
   */
  async create(payload: CreateExerciseTrainingPayload): Promise<ExerciseTraining> {
    try {
      console.log('[ExerciseTrainingsService] Criando vínculo:', payload);
      const response = await api.post<ExerciseTraining>('/exercise-trainings', payload);
      console.log('[ExerciseTrainingsService] Vínculo criado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar vínculo exercício-treino:', error);
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  }

  /**
   * Deleta um vínculo exercício-treino
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/exercise-trainings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar vínculo ${id}:`, error);
      throw error;
    }
  }
}

export default new ExerciseTrainingsService();

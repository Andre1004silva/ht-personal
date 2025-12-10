import api from './api';

export type RoutineType = 'Dia da semana' | 'Numérico';
export type Goal = 
  | 'Hipertrofia' 
  | 'Redução de gordura' 
  | 'Redução de gordura/hipertrofia' 
  | 'Definição muscular' 
  | 'Condicionamento físico' 
  | 'Qualidade de vida';
export type Difficulty = 'Adaptação' | 'Iniciante' | 'Intermediário' | 'Avançado';

export interface TrainingRoutine {
  id?: number;
  admin_id?: number;
  trainer_id?: number;
  student_id: number;
  start_date: string;
  end_date: string;
  routine_type: RoutineType;
  goal: Goal;
  difficulty: Difficulty;
  instructions?: string;
  hide_after_expiration?: boolean;
  hide_before_start?: boolean;
  created_at?: string;
  updated_at?: string;
  // Campos de join
  student_name?: string;
  trainer_name?: string;
}

export interface CreateTrainingRoutinePayload {
  student_id: number;
  trainer_id?: number;
  start_date: string;
  end_date: string;
  routine_type: RoutineType;
  goal: Goal;
  difficulty: Difficulty;
  instructions?: string;
  hide_after_expiration?: boolean;
  hide_before_start?: boolean;
}

export interface UpdateTrainingRoutinePayload {
  student_id?: number;
  trainer_id?: number;
  start_date?: string;
  end_date?: string;
  routine_type?: RoutineType;
  goal?: Goal;
  difficulty?: Difficulty;
  instructions?: string;
  hide_after_expiration?: boolean;
  hide_before_start?: boolean;
}

class TrainingRoutinesService {
  /**
   * Busca todas as rotinas de treino
   * @param studentId - ID do aluno (opcional)
   * @param trainerId - ID do treinador (opcional)
   */
  async getAll(studentId?: number, trainerId?: number): Promise<TrainingRoutine[]> {
    try {
      const params: any = {};
      if (studentId) params.student_id = studentId;
      if (trainerId) params.trainer_id = trainerId;

      const response = await api.get<TrainingRoutine[]>('/training-routines', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar rotinas de treino:', error);
      throw error;
    }
  }

  /**
   * Busca uma rotina específica por ID
   */
  async getById(id: number): Promise<TrainingRoutine> {
    try {
      const response = await api.get<TrainingRoutine>(`/training-routines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar rotina ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria uma nova rotina de treino
   */
  async create(payload: CreateTrainingRoutinePayload): Promise<TrainingRoutine> {
    try {
      const response = await api.post<TrainingRoutine>('/training-routines', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar rotina de treino:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma rotina existente
   */
  async update(id: number, payload: UpdateTrainingRoutinePayload): Promise<{ message: string; routine: TrainingRoutine }> {
    try {
      const response = await api.put<{ message: string; routine: TrainingRoutine }>(`/training-routines/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar rotina ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta uma rotina
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/training-routines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar rotina ${id}:`, error);
      throw error;
    }
  }
}

export default new TrainingRoutinesService();

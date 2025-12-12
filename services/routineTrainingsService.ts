import api from './api';

export interface RoutineTraining {
  id?: number;
  routine_id: number;
  training_id: number;
  order?: number;
  is_active?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Campos de join
  training_name?: string;
  day_of_week?: string;
  training_notes?: string;
  student_id?: number;
  student_name?: string;
}

export interface CreateRoutineTrainingPayload {
  routine_id: number;
  training_id: number;
  order?: number;
  is_active?: boolean;
  notes?: string;
  exercise_settings?: Array<{
    exercise_id: number;
    rep_type?: 'reps-load' | 'reps-load-time' | 'complete-set' | 'reps-time';
    load?: number;
    set?: number;
    reps?: number;
    time?: number;
    rest?: number;
  }>;
}

export interface UpdateRoutineTrainingPayload {
  order?: number;
  is_active?: boolean;
  notes?: string;
}

class RoutineTrainingsService {
  /**
   * Busca todos os vínculos routine-training
   * @param routineId - ID da rotina (opcional)
   * @param trainingId - ID do treino (opcional)
   */
  async getAll(routineId?: number, trainingId?: number): Promise<RoutineTraining[]> {
    try {
      const params: any = {};
      if (routineId) params.routine_id = routineId;
      if (trainingId) params.training_id = trainingId;

      const response = await api.get<RoutineTraining[]>('/routine-trainings', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar vínculos routine-training:', error);
      throw error;
    }
  }

  /**
   * Busca um vínculo específico por ID
   */
  async getById(id: number): Promise<RoutineTraining> {
    try {
      const response = await api.get<RoutineTraining>(`/routine-trainings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vínculo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo vínculo routine-training
   */
  async create(payload: CreateRoutineTrainingPayload): Promise<RoutineTraining> {
    try {
      const response = await api.post<RoutineTraining>('/routine-trainings', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar vínculo routine-training:', error);
      throw error;
    }
  }

  /**
   * Lista exercícios resolvidos (preset + override) para um vínculo
   */
  async getResolvedExercises(id: number): Promise<Array<{
    exercise_id: number;
    exercise_name: string;
    rep_type: string | null;
    load: number | null;
    set: number | null;
    reps: number | null;
    time: number | null;
    rest: number | null;
  }>> {
    try {
      const response = await api.get(`/routine-trainings/${id}/resolved-exercises`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar exercícios resolvidos do vínculo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um vínculo existente
   */
  async update(id: number, payload: UpdateRoutineTrainingPayload): Promise<{ message: string; routineTraining: RoutineTraining }> {
    try {
      const response = await api.put<{ message: string; routineTraining: RoutineTraining }>(`/routine-trainings/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar vínculo ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um vínculo
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/routine-trainings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar vínculo ${id}:`, error);
      throw error;
    }
  }
}

export default new RoutineTrainingsService();

import api from './api';

export type RepetitionType = 'reps-load' | 'reps-load-time' | 'complete-set' | 'reps-time';

// Tipo base para todas as repetições
interface BaseRepetition {
  id?: number;
  exercise_id: number;
  created_at?: string;
}

// Reps-Load: série, repetições, carga e descanso
export interface RepsLoadRepetition extends BaseRepetition {
  set: number;
  reps: number;
  load: number;
  rest: number;
}

// Reps-Load-Time: repetições, carga e tempo
export interface RepsLoadTimeRepetition extends BaseRepetition {
  reps: number;
  load: number;
  time: number;
}

// Complete-Set: série, repetições, carga, tempo e descanso
export interface CompleteSetRepetition extends BaseRepetition {
  set: number;
  reps: number;
  load: number;
  time: number;
  rest: number;
}

// Reps-Time: série, repetições, tempo e descanso
export interface RepsTimeRepetition extends BaseRepetition {
  set: number;
  reps: number;
  time: number;
  rest: number;
}

// Union type para todos os tipos de repetição
export type Repetition = 
  | RepsLoadRepetition 
  | RepsLoadTimeRepetition 
  | CompleteSetRepetition 
  | RepsTimeRepetition;

// Payloads para criação
export type CreateRepsLoadPayload = Omit<RepsLoadRepetition, 'id' | 'created_at'>;
export type CreateRepsLoadTimePayload = Omit<RepsLoadTimeRepetition, 'id' | 'created_at'>;
export type CreateCompleteSetPayload = Omit<CompleteSetRepetition, 'id' | 'created_at'>;
export type CreateRepsTimePayload = Omit<RepsTimeRepetition, 'id' | 'created_at'>;

export type CreateRepetitionPayload = 
  | CreateRepsLoadPayload 
  | CreateRepsLoadTimePayload 
  | CreateCompleteSetPayload 
  | CreateRepsTimePayload;

class RepetitionsService {
  /**
   * Cria uma nova repetição
   * @param type - Tipo da repetição
   * @param payload - Dados da repetição
   */
  async create<T extends Repetition>(
    type: RepetitionType, 
    payload: CreateRepetitionPayload
  ): Promise<T> {
    try {
      const response = await api.post<T>(`/repetitions/${type}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Erro ao criar repetição do tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Busca todas as repetições de um tipo
   * @param type - Tipo da repetição
   * @param exerciseId - ID do exercício (opcional)
   */
  async getAll<T extends Repetition>(
    type: RepetitionType, 
    exerciseId?: number
  ): Promise<T[]> {
    try {
      const params: any = {};
      if (exerciseId) params.exercise_id = exerciseId;

      const response = await api.get<T[]>(`/repetitions/${type}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar repetições do tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Busca uma repetição específica por ID
   * @param type - Tipo da repetição
   * @param id - ID da repetição
   */
  async getById<T extends Repetition>(type: RepetitionType, id: number): Promise<T> {
    try {
      const response = await api.get<T>(`/repetitions/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar repetição ${id} do tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Deleta uma repetição
   * @param type - Tipo da repetição
   * @param id - ID da repetição
   */
  async delete(type: RepetitionType, id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/repetitions/${type}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar repetição ${id} do tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Cria múltiplas repetições do tipo reps-load (mais comum)
   * @param exerciseId - ID do exercício
   * @param repetitions - Array de repetições
   */
  async createMultipleRepsLoad(
    exerciseId: number, 
    repetitions: Array<Omit<CreateRepsLoadPayload, 'exercise_id'>>
  ): Promise<RepsLoadRepetition[]> {
    try {
      const promises = repetitions.map(rep => 
        this.create<RepsLoadRepetition>('reps-load', {
          exercise_id: exerciseId,
          ...rep
        })
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Erro ao criar múltiplas repetições:', error);
      throw error;
    }
  }

  /**
   * Atualiza somente a carga de uma repetição (tipos com carga)
   */
  async updateLoad(type: Extract<RepetitionType, 'reps-load' | 'reps-load-time' | 'complete-set'>, id: number, load: number): Promise<{ message: string; repetition: any }> {
    try {
      const response = await api.patch<{ message: string; repetition: any }>(`/repetitions/${type}/${id}/load`, { load });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar carga da repetição ${id} do tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Evolução de carga por aluno (série temporal por exercício)
   */
  async getLoadProgressByStudent(studentId: number, filters?: { exercise_id?: number; start_date?: string; end_date?: string }): Promise<{ student_id: number; exercises: Array<{ exercise_id: number; exercise_name: string; progress: Array<{ type: RepetitionType | 'complete-set' | 'reps-load-time' | 'reps-load'; set: number | null; reps: number | null; load: number | null; time: number | null; rest: number | null; created_at: string; }> }> }> {
    try {
      const params: any = {};
      if (filters?.exercise_id) params.exercise_id = filters.exercise_id;
      if (filters?.start_date) params.start_date = filters.start_date;
      if (filters?.end_date) params.end_date = filters.end_date;
      const response = await api.get(`/repetitions/load-progress/student/${studentId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evolução de carga do aluno ${studentId}:`, error);
      throw error;
    }
  }
}

export default new RepetitionsService();

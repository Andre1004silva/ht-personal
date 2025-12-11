import api from './api';

export type RepetitionType = 'reps-load' | 'reps-load-time' | 'complete-set' | 'reps-time' | 'cadence' | 'notes' | 'running' | 'time-incline';

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

// Cadence: cadência
export interface CadenceRepetition extends BaseRepetition {
  cadence: string;
}

// Notes: observações
export interface NotesRepetition extends BaseRepetition {
  notes: string;
}

// Running: corrida - velocidade, distância, tempo, pace, intervalo
export interface RunningRepetition extends BaseRepetition {
  speed?: number;
  distance?: number;
  time?: number;
  pace?: string;
  rest: number;
}

// Time-Incline: tempo e inclinação
export interface TimeInclineRepetition extends BaseRepetition {
  time: number;
  incline: number;
  rest: number;
}

// Union type para todos os tipos de repetição
export type Repetition = 
  | RepsLoadRepetition 
  | RepsLoadTimeRepetition 
  | CompleteSetRepetition 
  | RepsTimeRepetition
  | CadenceRepetition
  | NotesRepetition
  | RunningRepetition
  | TimeInclineRepetition;

// Payloads para criação
export type CreateRepsLoadPayload = Omit<RepsLoadRepetition, 'id' | 'created_at'>;
export type CreateRepsLoadTimePayload = Omit<RepsLoadTimeRepetition, 'id' | 'created_at'>;
export type CreateCompleteSetPayload = Omit<CompleteSetRepetition, 'id' | 'created_at'>;
export type CreateRepsTimePayload = Omit<RepsTimeRepetition, 'id' | 'created_at'>;
export type CreateCadencePayload = Omit<CadenceRepetition, 'id' | 'created_at'>;
export type CreateNotesPayload = Omit<NotesRepetition, 'id' | 'created_at'>;
export type CreateRunningPayload = Omit<RunningRepetition, 'id' | 'created_at'>;
export type CreateTimeInclinePayload = Omit<TimeInclineRepetition, 'id' | 'created_at'>;

export type CreateRepetitionPayload = 
  | CreateRepsLoadPayload 
  | CreateRepsLoadTimePayload 
  | CreateCompleteSetPayload 
  | CreateRepsTimePayload
  | CreateCadencePayload
  | CreateNotesPayload
  | CreateRunningPayload
  | CreateTimeInclinePayload;

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
}

export default new RepetitionsService();

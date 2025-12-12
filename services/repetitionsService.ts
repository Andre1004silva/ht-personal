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
   * Busca todas as repetições de um exercício específico em todas as tabelas
   * @param exerciseId - ID do exercício
   * @param adminId - ID do admin (opcional, será usado o padrão se não fornecido)
   */
  async getByExercise(exerciseId: number, adminId?: number): Promise<{
    exercise_id: number;
    exercise_name: string;
    repetitions: Array<{
      id: number;
      type: string;
      formatted: string;
      created_at: string;
      [key: string]: any;
    }>;
  }> {
    try {
      const headers: any = {};
      if (adminId) {
        headers['admin_id'] = adminId.toString();
      }
      
      const response = await api.get(`/repetitions/exercise/${exerciseId}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar repetições do exercício ${exerciseId}:`, error);
      
      // Log mais detalhado do erro
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
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

  /**
   * Cria uma repetição automaticamente baseada no tipo do exercício
   * @param exerciseId - ID do exercício
   * @param payload - Dados da repetição (campos variam baseado no tipo do exercício)
   */
  async createAuto<T extends Repetition>(
    exerciseId: number, 
    payload: any
  ): Promise<T & { type: RepetitionType; message: string }> {
    try {
      const response = await api.post<T & { type: RepetitionType; message: string }>(`/repetitions/auto/${exerciseId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição automaticamente:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição de corrida
   */
  async createRunning(payload: {
    exercise_id: number;
    speed?: number;
    distance?: number;
    time?: number;
    pace?: string;
    rest: number;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/running', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição de corrida:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição de cadência
   */
  async createCadence(payload: {
    exercise_id: number;
    cadence: string;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/cadence', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição de cadência:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição com observações
   */
  async createNotes(payload: {
    exercise_id: number;
    notes: string;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/notes', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição com observações:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição tempo-inclinação
   */
  async createTimeIncline(payload: {
    exercise_id: number;
    time: number;
    incline: number;
    rest: number;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/time-incline', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição tempo-inclinação:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição reps-load
   */
  async createRepsLoad(payload: {
    exercise_id: number;
    set: number;
    reps: number;
    load: number;
    rest: number;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/reps-load', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição reps-load:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição reps-load-time
   */
  async createRepsLoadTime(payload: {
    exercise_id: number;
    reps: number;
    load: number;
    time: number;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/reps-load-time', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição reps-load-time:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição complete-set
   */
  async createCompleteSet(payload: {
    exercise_id: number;
    set: number;
    reps: number;
    load: number;
    time: number;
    rest: number;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/complete-set', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição complete-set:', error);
      throw error;
    }
  }

  /**
   * Cria uma repetição reps-time
   */
  async createRepsTime(payload: {
    exercise_id: number;
    set: number;
    reps: number;
    time: number;
    rest: number;
  }): Promise<any> {
    try {
      const response = await api.post('/repetitions/reps-time', payload);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar repetição reps-time:', error);
      throw error;
    }
  }
}

export default new RepetitionsService();

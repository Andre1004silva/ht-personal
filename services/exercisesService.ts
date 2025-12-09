import api from './api';

export interface Exercise {
  id?: number;
  admin_id?: number;
  treinador_id?: number;
  name: string; // Backend usa 'name'
  nome?: string; // Alias para compatibilidade
  repetitions?: string; // Backend usa 'repetitions'
  repeticoes?: string; // Alias para compatibilidade
  series?: string;
  carga?: string;
  notes?: string;
  treinador_name?: string;
  // Campos legados do frontend (não existem no backend)
  categoria?: string;
  grupoMuscular?: string;
  equipamento?: string;
  dificuldade?: 'Iniciante' | 'Intermediário' | 'Avançado';
  descricao?: string;
  video_url?: string;
  imagem?: string;
  instrucoes?: string;
  tempo_descanso?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseResponse {
  data: Exercise[];
  total?: number;
}

class ExercisesService {
  /**
   * Normaliza os dados do exercício para compatibilidade
   */
  private normalizeExercise(exercise: any): Exercise {
    return {
      ...exercise,
      nome: exercise.name || exercise.nome,
      repeticoes: exercise.repetitions || exercise.repeticoes,
      descricao: exercise.notes || exercise.descricao,
    };
  }

  /**
   * Busca todos os exercícios
   */
  async getAll(): Promise<Exercise[]> {
    try {
      const response = await api.get<Exercise[]>('/exercises');
      return response.data.map(e => this.normalizeExercise(e));
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      throw error;
    }
  }

  /**
   * Busca um exercício específico por ID
   */
  async getById(id: number): Promise<Exercise> {
    try {
      const response = await api.get<Exercise>(`/exercises/${id}`);
      return this.normalizeExercise(response.data);
    } catch (error) {
      console.error(`Erro ao buscar exercício ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo exercício
   */
  async create(exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    try {
      // Converte para o formato do backend
      const payload = {
        name: exercise.name || exercise.nome,
        repetitions: exercise.repetitions || exercise.repeticoes,
        series: exercise.series,
        carga: exercise.carga,
        notes: exercise.notes || exercise.descricao,
        trainer_id: exercise.treinador_id,
      };
      const response = await api.post<Exercise>('/exercises', payload);
      return this.normalizeExercise(response.data);
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      throw error;
    }
  }

  /**
   * Atualiza um exercício existente
   */
  async update(id: number, exercise: Partial<Exercise>): Promise<Exercise> {
    try {
      // Converte para o formato do backend
      const payload: any = {};
      if (exercise.name || exercise.nome) payload.name = exercise.name || exercise.nome;
      if (exercise.repetitions || exercise.repeticoes) payload.repetitions = exercise.repetitions || exercise.repeticoes;
      if (exercise.series !== undefined) payload.series = exercise.series;
      if (exercise.carga !== undefined) payload.carga = exercise.carga;
      if (exercise.notes || exercise.descricao) payload.notes = exercise.notes || exercise.descricao;
      if (exercise.treinador_id !== undefined) payload.trainer_id = exercise.treinador_id;
      
      const response = await api.put<Exercise>(`/exercises/${id}`, payload);
      return this.normalizeExercise(response.data);
    } catch (error) {
      console.error(`Erro ao atualizar exercício ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um exercício
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/exercises/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar exercício ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca exercícios por categoria
   */
  async getByCategory(categoria: string): Promise<Exercise[]> {
    try {
      const response = await api.get<Exercise[]>(`/exercises?categoria=${categoria}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar exercícios da categoria ${categoria}:`, error);
      throw error;
    }
  }

  /**
   * Busca exercícios por grupo muscular
   */
  async getByMuscleGroup(grupoMuscular: string): Promise<Exercise[]> {
    try {
      const response = await api.get<Exercise[]>(`/exercises?grupoMuscular=${grupoMuscular}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar exercícios do grupo muscular ${grupoMuscular}:`, error);
      throw error;
    }
  }
}

export default new ExercisesService();

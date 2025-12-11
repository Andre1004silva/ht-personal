import api from './api';

export interface Exercise {
  id?: number;
  admin_id?: number;
  trainer_id?: number;
  treinador_id?: number;
  name: string; // Backend usa 'name'
  nome?: string; // Alias para compatibilidade
  muscle_group?: string; // Backend usa 'muscle_group'
  equipment?: string; // Backend usa 'equipment'
  video_url?: string; // Backend usa 'video_url'
  image_url?: string; // Backend usa 'image_url'
  favorites?: boolean; // Backend usa 'favorites'
  repetitions?: string; // Backend usa 'repetitions'
  repeticoes?: string; // Alias para compatibilidade
  series?: string;
  carga?: string;
  notes?: string;
  treinador_name?: string;
  trainer_name?: string;
  // Campos legados do frontend (não existem no backend)
  categoria?: string;
  grupoMuscular?: string;
  equipamento?: string;
  dificuldade?: 'Iniciante' | 'Intermediário' | 'Avançado';
  descricao?: string;
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
  async create(exercise: any): Promise<Exercise> {
    try {
      // Converte para o formato do backend
      const payload: any = {
        name: exercise.name || exercise.nome,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment,
        video_url: exercise.video_url,
        image_url: exercise.image_url,
        favorites: exercise.favorites || false,
        notes: exercise.notes || exercise.descricao,
        trainer_id: exercise.trainer_id || exercise.treinador_id,
      };

      // Adiciona repetição se fornecida
      if (exercise.repetition) {
        payload.repetition = exercise.repetition;
      }

      const response = await api.post<any>('/exercises', payload);
      return this.normalizeExercise(response.data.exercise || response.data);
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

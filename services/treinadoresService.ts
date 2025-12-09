import api from './api';

export interface Treinador {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  cref?: string;
  foto?: string;
  bio?: string;
  experiencia_anos?: number;
  formacao?: string;
  especialidades?: string; // lista separada por vírgula
  horario_funcionamento?: string; // semana
  horario_sabado?: string;
  horario_domingo?: string;
  instagram?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreinadorResponse {
  data: Treinador[];
  total?: number;
}

class TreinadoresService {
  private normalizeTreinador(t: any): Treinador {
    return {
      id: t.id,
      nome: t.name,
      email: t.email,
      telefone: t.phone_number,
      especialidade: t.position,
      cref: t.document,
      bio: t.about_me,
      experiencia_anos: t.years_of_experience,
      formacao: t.academic_background,
      especialidades: t.specialties,
      horario_funcionamento: undefined,
      horario_sabado: undefined,
      horario_domingo: undefined,
      created_at: t.created_at,
      updated_at: t.updated_at,
    };
  }
  /**
   * Busca todos os treinadores
   */
  async getAll(): Promise<Treinador[]> {
    try {
      const response = await api.get<any[]>('/trainers');
      return response.data.map(t => this.normalizeTreinador(t));
    } catch (error) {
      console.error('Erro ao buscar treinadores:', error);
      throw error;
    }
  }

  /**
   * Busca um treinador específico por ID
   */
  async getById(id: number): Promise<Treinador> {
    try {
      const response = await api.get<any>(`/trainers/${id}`);
      return this.normalizeTreinador(response.data);
    } catch (error) {
      console.error(`Erro ao buscar treinador ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo treinador
   */
  async create(treinador: Omit<Treinador, 'id' | 'created_at' | 'updated_at'>): Promise<Treinador> {
    try {
      const payload: any = {
        name: treinador.nome,
        email: treinador.email,
        phone_number: treinador.telefone,
        document: treinador.cref,
        position: treinador.especialidade,
        about_me: treinador.bio,
        years_of_experience: treinador.experiencia_anos,
        academic_background: treinador.formacao,
        specialties: treinador.especialidades,
        // password deve ser enviado onde for aplicável
      };
      const response = await api.post<any>('/trainers', payload);
      return this.normalizeTreinador(response.data);
    } catch (error) {
      console.error('Erro ao criar treinador:', error);
      throw error;
    }
  }

  /**
   * Atualiza um treinador existente
   */
  async update(id: number, treinador: Partial<Treinador>): Promise<Treinador> {
    try {
      const payload: any = {};
      if (treinador.nome !== undefined) payload.name = treinador.nome;
      if (treinador.email !== undefined) payload.email = treinador.email;
      if (treinador.telefone !== undefined) payload.phone_number = treinador.telefone;
      if (treinador.cref !== undefined) payload.document = treinador.cref;
      if (treinador.especialidade !== undefined) payload.position = treinador.especialidade;
      if (treinador.bio !== undefined) payload.about_me = treinador.bio;
      if (treinador.experiencia_anos !== undefined) payload.years_of_experience = treinador.experiencia_anos;
      if (treinador.formacao !== undefined) payload.academic_background = treinador.formacao;
      if (treinador.especialidades !== undefined) payload.specialties = treinador.especialidades;
      
      

      const response = await api.put<{ message: string; treinador: any }>(`/trainers/${id}`, payload);
      return this.normalizeTreinador(response.data.treinador || response.data);
    } catch (error) {
      console.error(`Erro ao atualizar treinador ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um treinador
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/trainers/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar treinador ${id}:`, error);
      throw error;
    }
  }
}

export default new TreinadoresService();

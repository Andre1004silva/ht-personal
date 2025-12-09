import api from './api';

export interface AgendaPoint {
  id?: number;
  admin_id?: number;
  student_id: number;
  training_date: string;
  duration_times?: string;
  notes?: string;
  day_week?: string;
  created_at?: string;
  updated_at?: string;
  student_name?: string;
}

export interface CreateAgendaPointPayload {
  student_id: number;
  training_date: string;
  duration_times?: string;
  notes?: string;
  day_week?: string;
}

export interface UpdateAgendaPointPayload {
  training_date?: string;
  duration_times?: string;
  notes?: string;
  day_week?: string;
}

class AgendaPointService {
  /**
   * Cria um novo ponto de agenda
   */
  async create(payload: CreateAgendaPointPayload): Promise<AgendaPoint> {
    try {
      console.log('[AgendaPointService] Criando ponto de agenda:', payload);
      const response = await api.post<AgendaPoint>('/schedule-appointments', payload);
      console.log('[AgendaPointService] Ponto criado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar ponto de agenda:', error);
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  }

  /**
   * Busca todos os pontos de agenda
   */
  async getAll(filters?: {
    student_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<AgendaPoint[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.student_id) params.append('student_id', filters.student_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const url = params.toString() ? `/schedule-appointments?${params.toString()}` : '/schedule-appointments';
      const response = await api.get<AgendaPoint[]>(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pontos de agenda:', error);
      throw error;
    }
  }

  /**
   * Busca um ponto específico por ID
   */
  async getById(id: number): Promise<AgendaPoint> {
    try {
      const response = await api.get<AgendaPoint>(`/schedule-appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ponto ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca pontos por data específica
   */
  async getByDate(date: string): Promise<AgendaPoint[]> {
    try {
      const response = await api.get<AgendaPoint[]>(`/schedule-appointments/date/${date}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pontos da data ${date}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um ponto existente
   */
  async update(id: number, payload: UpdateAgendaPointPayload): Promise<{ message: string; agendaPoint: AgendaPoint }> {
    try {
      console.log('[AgendaPointService] Atualizando ponto:', id, payload);
      const response = await api.put<{ message: string; agendaPoint: AgendaPoint }>(`/schedule-appointments/${id}`, payload);
      console.log('[AgendaPointService] Ponto atualizado com sucesso:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao atualizar ponto ${id}:`, error);
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  }

  /**
   * Deleta um ponto
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/schedule-appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao deletar ponto ${id}:`, error);
      throw error;
    }
  }

  /**
   * Registra ponto de treino para o dia atual
   */
  async registrarPonto(studentId: number, workoutInfo: {
    workoutName: string;
    duration: string;
    dayName: string;
    notes?: string;
  }): Promise<AgendaPoint> {
    const now = new Date();
    const trainingDate = now.toISOString();
    
    const payload: CreateAgendaPointPayload = {
      student_id: studentId,
      training_date: trainingDate,
      duration_times: workoutInfo.duration,
      day_week: workoutInfo.dayName,
      notes: workoutInfo.notes || `Treino registrado: ${workoutInfo.workoutName}`,
    };

    return this.create(payload);
  }
}

export default new AgendaPointService();

import api from './api';

export interface TrainerScheduleSlot {
  id?: number;
  trainer_id: number;
  day_of_week: number; // 1..7 (Segunda..Domingo)
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

class TrainerSchedulesService {
  async list(trainerId: number): Promise<TrainerScheduleSlot[]> {
    const res = await api.get<TrainerScheduleSlot[]>(`/trainers/${trainerId}/schedules`);
    return res.data;
  }

  async create(trainerId: number, slot: Omit<TrainerScheduleSlot, 'id' | 'trainer_id' | 'created_at' | 'updated_at'>): Promise<TrainerScheduleSlot> {
    const res = await api.post<TrainerScheduleSlot>(`/trainers/${trainerId}/schedules`, slot);
    return res.data;
  }

  async update(trainerId: number, id: number, slot: Partial<TrainerScheduleSlot>): Promise<TrainerScheduleSlot> {
    const res = await api.put<{ message: string; horario: TrainerScheduleSlot }>(`/trainers/${trainerId}/schedules/${id}`, slot);
    return res.data.horario;
  }

  async delete(trainerId: number, id: number): Promise<void> {
    await api.delete(`/trainers/${trainerId}/schedules/${id}`);
  }

  async replaceAll(trainerId: number, slots: Array<Omit<TrainerScheduleSlot, 'id' | 'trainer_id' | 'created_at' | 'updated_at'>>): Promise<TrainerScheduleSlot[]> {
    const res = await api.put<{ message: string; horarios: TrainerScheduleSlot[] }>(`/trainers/${trainerId}/schedules`, { slots });
    return res.data.horarios;
  }
}

export default new TrainerSchedulesService();

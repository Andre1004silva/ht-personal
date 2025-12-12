import api from './api';

export interface FeedbackData {
  admin_id: number;
  trainer_id: number;
  student_id: number;
  note: string;
}

export interface FeedbackResponse {
  id: number;
  admin_id: number;
  trainer_id: number;
  student_id: number;
  note: string;
  created_at: string;
  updated_at: string;
}

class FeedbackService {
  async createFeedback(data: FeedbackData): Promise<FeedbackResponse> {
    try {
      const response = await api.post('/feedback', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar feedback:', error);
      throw error;
    }
  }

  async uploadFeedbackPhotos(feedbackId: number, photos: FormData): Promise<any> {
    try {
      const response = await api.post(`/feedback/${feedbackId}/photos`, photos, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar fotos do feedback:', error);
      throw error;
    }
  }

  async getFeedbacks(filters?: {
    admin_id?: number;
    trainer_id?: number;
    student_id?: number;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const response = await api.get('/feedback', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      throw error;
    }
  }
}

export default new FeedbackService();

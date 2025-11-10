/**
 * Tipos compartilhados para a API
 */

// Resposta padrão da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Resposta paginada
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Erro da API
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Parâmetros de paginação
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Parâmetros de filtro
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// Status de requisição
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

// Estado de requisição
export interface RequestState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
}

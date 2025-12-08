import api from './api';

export interface Cliente {
  id?: number;
  admin_id?: number;
  treinador_id?: number;
  name: string;
  email?: string;
  password?: string; // Obrigatório apenas na criação
  phone_number?: string;
  date_of_birth?: string; // Formato: YYYY-MM-DD
  age?: number; // Backend espera number, não string
  gender?: string;
  treinador_name?: string; // Retornado pelo backend em joins
  created_at?: string;
  updated_at?: string;
}

export interface ClienteResponse {
  data: Cliente[];
  total?: number;
}

class ClientesService {
  /**
   * Normaliza os dados do cliente vindos do backend
   */
  private normalizeCliente(cliente: any): Cliente {
    return {
      ...cliente,
      // Garante que age seja number ou undefined
      age: cliente.age ? Number(cliente.age) : undefined,
    };
  }

  /**
   * Busca todos os clientes
   */
  async getAll(filters?: { treinador_id?: number; term?: string }): Promise<Cliente[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.treinador_id) params.append('treinador_id', filters.treinador_id.toString());
      if (filters?.term) params.append('term', filters.term);

      const url = params.toString() ? `/clientes?${params.toString()}` : '/clientes';
      const response = await api.get<Cliente[]>(url);
      return response.data.map(c => this.normalizeCliente(c));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  /**
   * Busca um cliente específico por ID
   */
  async getById(id: number): Promise<Cliente> {
    try {
      const response = await api.get<Cliente>(`/clientes/${id}`);
      return this.normalizeCliente(response.data);
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cria um novo cliente
   */
  async create(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    try {
      // Monta payload conforme esperado pelo backend
      const payload: any = {
        name: cliente.name,
        email: cliente.email,
        password: cliente.password,
      };
      
      // Adiciona campos opcionais apenas se tiverem valor
      if (cliente.phone_number && cliente.phone_number.trim()) {
        payload.phone_number = cliente.phone_number;
      }
      
      if (cliente.date_of_birth && cliente.date_of_birth.trim()) {
        payload.date_of_birth = cliente.date_of_birth;
      }
      
      if (cliente.age !== undefined && cliente.age !== null) {
        payload.age = Number(cliente.age); // Backend espera number
      }
      
      if (cliente.gender && cliente.gender.trim()) {
        payload.gender = cliente.gender;
      }
      
      if (cliente.treinador_id) {
        payload.treinador_id = cliente.treinador_id;
      }
      
      console.log('[ClientesService] Payload enviado:', payload);
      const response = await api.post<Cliente>('/clientes', payload);
      return this.normalizeCliente(response.data);
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  }

  /**
   * Atualiza um cliente existente
   */
  async update(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    try {
      // Monta payload conforme esperado pelo backend
      const payload: any = {};
      
      if (cliente.name !== undefined) payload.name = cliente.name;
      if (cliente.email !== undefined) payload.email = cliente.email;
      if (cliente.password !== undefined) payload.password = cliente.password;
      if (cliente.phone_number !== undefined) payload.phone_number = cliente.phone_number;
      if (cliente.date_of_birth !== undefined) payload.date_of_birth = cliente.date_of_birth;
      if (cliente.age !== undefined) payload.age = Number(cliente.age); // Backend espera number
      if (cliente.gender !== undefined) payload.gender = cliente.gender;
      if (cliente.treinador_id !== undefined) payload.treinador_id = cliente.treinador_id;
      
      const response = await api.put<any>(`/clientes/${id}`, payload);
      // Backend retorna { message, cliente }
      const clienteData = response.data.cliente || response.data;
      return this.normalizeCliente(clienteData);
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um cliente
   */
  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar cliente ${id}:`, error);
      throw error;
    }
  }
}

export default new ClientesService();

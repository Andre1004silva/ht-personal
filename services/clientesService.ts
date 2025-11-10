import api from './api';

export interface Cliente {
  id?: number;
  admin_id?: number;
  treinador_id?: number;
  name: string; // API usa 'name' ao invés de 'nome'
  nome?: string; // Alias para compatibilidade
  email?: string;
  password?: string; // Obrigatório apenas na criação
  phone_number?: string; // API usa 'phone_number'
  telefone?: string; // Alias para compatibilidade
  date_of_birth?: string; // API usa 'date_of_birth'
  data_nascimento?: string; // Alias para compatibilidade
  gender?: string;
  treinador_name?: string;
  created_at?: string;
  updated_at?: string;
  // Campos legados (não existem no backend)
  tipo?: string;
  experiencia?: string;
  foto?: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
  observacoes?: string;
}

export interface ClienteResponse {
  data: Cliente[];
  total?: number;
}

class ClientesService {
  /**
   * Normaliza os dados do cliente para compatibilidade
   */
  private normalizeCliente(cliente: any): Cliente {
    return {
      ...cliente,
      nome: cliente.name || cliente.nome,
      telefone: cliente.phone_number || cliente.telefone,
      data_nascimento: cliente.date_of_birth || cliente.data_nascimento,
    };
  }

  /**
   * Busca todos os clientes
   */
  async getAll(): Promise<Cliente[]> {
    try {
      const response = await api.get<Cliente[]>('/clientes');
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
      const response = await api.post<Cliente>('/clientes', cliente);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  /**
   * Atualiza um cliente existente
   */
  async update(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
    try {
      const response = await api.put<Cliente>(`/clientes/${id}`, cliente);
      return response.data;
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

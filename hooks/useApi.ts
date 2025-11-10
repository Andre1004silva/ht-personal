import { useState, useEffect, useCallback } from 'react';

/**
 * Hook customizado para facilitar o uso de serviços da API
 * 
 * @example
 * const { data, loading, error, refetch } = useApi(clientesService.getAll);
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  autoFetch: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err: any) {
      console.error('Erro na requisição:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook para operações de mutação (create, update, delete)
 * 
 * @example
 * const { mutate, loading, error } = useMutation(clientesService.create);
 * await mutate({ nome: 'João', email: 'joao@example.com' });
 */
export function useMutation<TData, TVariables>(
  mutationFunction: (variables: TVariables) => Promise<TData>
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFunction(variables);
        setData(result);
        return result;
      } catch (err: any) {
        console.error('Erro na mutação:', err);
        const errorMessage = err.message || 'Erro ao executar operação';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFunction]
  );

  return {
    mutate,
    loading,
    error,
    data,
  };
}

# Exemplos de Uso dos Hooks Customizados

## useApi Hook

O hook `useApi` simplifica o carregamento de dados da API, gerenciando automaticamente os estados de loading, error e data.

### Exemplo Básico

```typescript
import { useApi } from '@/hooks/useApi';
import { clientesService } from '@/services';

function AlunosScreen() {
  const { data: clientes, loading, error, refetch } = useApi(
    () => clientesService.getAll()
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <FlatList
      data={clientes}
      onRefresh={refetch}
      refreshing={loading}
      renderItem={({ item }) => <ClienteCard cliente={item} />}
    />
  );
}
```

### Exemplo com Parâmetros

```typescript
function ClienteDetailsScreen({ route }) {
  const { id } = route.params;
  
  const { data: cliente, loading, error, refetch } = useApi(
    () => clientesService.getById(id)
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!cliente) return <NotFound />;

  return (
    <View>
      <Text>{cliente.nome}</Text>
      <Text>{cliente.email}</Text>
    </View>
  );
}
```

### Exemplo sem Auto-Fetch

```typescript
function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Não busca automaticamente ao montar
  const { data: results, loading, error, refetch } = useApi(
    () => exercisesService.getByCategory(searchTerm),
    false // autoFetch = false
  );

  const handleSearch = () => {
    refetch(); // Busca manualmente
  };

  return (
    <View>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={handleSearch}
      />
      {loading && <ActivityIndicator />}
      {results && <ResultsList data={results} />}
    </View>
  );
}
```

## useMutation Hook

O hook `useMutation` é usado para operações que modificam dados (create, update, delete).

### Exemplo de Criação

```typescript
import { useMutation } from '@/hooks/useApi';
import { clientesService } from '@/services';

function CreateClienteScreen() {
  const { mutate: createCliente, loading, error } = useMutation(
    clientesService.create
  );

  const handleSubmit = async (formData) => {
    try {
      const novoCliente = await createCliente(formData);
      Alert.alert('Sucesso', 'Cliente criado com sucesso!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', error || 'Erro ao criar cliente');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextInput name="nome" placeholder="Nome" />
      <TextInput name="email" placeholder="Email" />
      <Button 
        title="Criar Cliente" 
        onPress={handleSubmit}
        loading={loading}
      />
    </Form>
  );
}
```

### Exemplo de Atualização

```typescript
function EditClienteScreen({ route }) {
  const { id } = route.params;
  const { data: cliente } = useApi(() => clientesService.getById(id));
  
  const { mutate: updateCliente, loading, error } = useMutation(
    (data) => clientesService.update(id, data)
  );

  const handleUpdate = async (formData) => {
    try {
      await updateCliente(formData);
      Alert.alert('Sucesso', 'Cliente atualizado!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', error || 'Erro ao atualizar');
    }
  };

  if (!cliente) return <LoadingSpinner />;

  return (
    <Form initialValues={cliente} onSubmit={handleUpdate}>
      <TextInput name="nome" />
      <TextInput name="email" />
      <Button title="Salvar" loading={loading} />
    </Form>
  );
}
```

### Exemplo de Deleção

```typescript
function ClienteCard({ cliente, onDelete }) {
  const { mutate: deleteCliente, loading } = useMutation(
    () => clientesService.delete(cliente.id!)
  );

  const handleDelete = () => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente deletar este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCliente(undefined as any);
              onDelete(cliente.id);
              Alert.alert('Sucesso', 'Cliente deletado!');
            } catch (err) {
              Alert.alert('Erro', 'Erro ao deletar cliente');
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>{cliente.nome}</Text>
      <Button 
        title="Deletar" 
        onPress={handleDelete}
        loading={loading}
      />
    </View>
  );
}
```

## Combinando Hooks

### Exemplo de Tela Completa com CRUD

```typescript
function ClientesScreen() {
  // Buscar todos os clientes
  const { 
    data: clientes, 
    loading: loadingList, 
    error: errorList, 
    refetch 
  } = useApi(() => clientesService.getAll());

  // Deletar cliente
  const { 
    mutate: deleteCliente, 
    loading: loadingDelete 
  } = useMutation((id: number) => clientesService.delete(id));

  const handleDelete = async (id: number) => {
    try {
      await deleteCliente(id);
      refetch(); // Recarrega a lista
      Alert.alert('Sucesso', 'Cliente deletado!');
    } catch (err) {
      Alert.alert('Erro', 'Erro ao deletar cliente');
    }
  };

  if (loadingList) return <LoadingSpinner />;
  if (errorList) return <ErrorMessage message={errorList} onRetry={refetch} />;

  return (
    <FlatList
      data={clientes}
      onRefresh={refetch}
      refreshing={loadingList}
      renderItem={({ item }) => (
        <ClienteCard
          cliente={item}
          onDelete={handleDelete}
          deleting={loadingDelete}
        />
      )}
    />
  );
}
```

## Vantagens dos Hooks

1. **Menos código boilerplate**: Não precisa gerenciar manualmente os estados de loading, error e data
2. **Reutilizável**: Use em qualquer componente
3. **Type-safe**: Totalmente tipado com TypeScript
4. **Consistente**: Mesmo padrão em toda a aplicação
5. **Fácil de testar**: Lógica isolada e testável

## Quando NÃO usar os Hooks

- Quando precisar de controle muito fino sobre o estado
- Quando a lógica de fetch for muito complexa
- Quando precisar de cache avançado (considere usar React Query)

Para casos mais complexos, considere usar bibliotecas como:
- [React Query](https://tanstack.com/query)
- [SWR](https://swr.vercel.app/)
- [Apollo Client](https://www.apollographql.com/docs/react/) (para GraphQL)

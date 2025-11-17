# Integração da API - High Training

## 📋 Visão Geral

Este documento descreve como a integração com a API do back-end foi implementada no aplicativo mobile.

## 🔧 Configuração

### 1. Instalação de Dependências

O axios já foi instalado no projeto:

```bash
npm install axios
```

### 2. Configuração da URL da API

Edite o arquivo `/config/env.ts` para configurar a URL da sua API:

```typescript
export const ENV = {
  API_URL: __DEV__ 
    ? 'http://localhost:3232' // Desenvolvimento
    : 'https://sua-api-producao.com', // Produção
};
```

#### Para testar em dispositivo físico:

1. Descubra o IP da sua máquina:
   - **Mac/Linux**: `ifconfig | grep "inet "`
   - **Windows**: `ipconfig`

2. Substitua `localhost` pelo IP da sua máquina:
   ```typescript
   API_URL: 'http://192.168.1.100:3232'
   ```

3. Certifique-se de que o back-end está rodando e acessível na rede local.

## 📁 Estrutura de Arquivos

```
personal-front/
├── config/
│   └── env.ts                 # Configuração de ambiente
├── services/
│   ├── api.ts                 # Configuração base do axios
│   ├── clientesService.ts     # Serviço de clientes
│   ├── exercisesService.ts    # Serviço de exercícios
│   ├── trainingsService.ts    # Serviço de treinos
│   ├── treinadoresService.ts  # Serviço de treinadores
│   └── index.ts               # Exportações centralizadas
└── screens/
    ├── AlunosScreen.tsx       # Tela de alunos (integrada)
    └── ExerciciosScreen.tsx   # Tela de exercícios (integrada)
```

## 🚀 Como Usar os Serviços

### Importando os Serviços

```typescript
import { clientesService, exercisesService, trainingsService } from '@/services';
import type { Cliente, Exercise, Training } from '@/services';
```

### Exemplos de Uso

#### 1. Buscar Todos os Clientes

```typescript
const loadClientes = async () => {
  try {
    const clientes = await clientesService.getAll();
    console.log(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
  }
};
```

#### 2. Buscar Cliente por ID

```typescript
const cliente = await clientesService.getById(1);
```

#### 3. Criar Novo Cliente

```typescript
const novoCliente = await clientesService.create({
  nome: 'João Silva',
  email: 'joao@example.com',
  telefone: '11999999999',
  tipo: 'Hipertrofia',
  experiencia: '2 anos'
});
```

#### 4. Atualizar Cliente

```typescript
const clienteAtualizado = await clientesService.update(1, {
  nome: 'João Silva Santos',
  telefone: '11988888888'
});
```

#### 5. Deletar Cliente

```typescript
await clientesService.delete(1);
```

## 🔌 Rotas Disponíveis no Back-end

### Clientes (`/clientes`)
- `GET /clientes` - Lista todos os clientes
- `GET /clientes/:id` - Busca um cliente específico
- `POST /clientes` - Cria um novo cliente
- `PUT /clientes/:id` - Atualiza um cliente
- `DELETE /clientes/:id` - Deleta um cliente

### Exercícios (`/exercises`)
- `GET /exercises` - Lista todos os exercícios
- `GET /exercises/:id` - Busca um exercício específico
- `POST /exercises` - Cria um novo exercício
- `PUT /exercises/:id` - Atualiza um exercício
- `DELETE /exercises/:id` - Deleta um exercício

### Treinos (`/trainings`)
- `GET /trainings` - Lista todos os treinos
- `GET /trainings/:id` - Busca um treino específico
- `POST /trainings` - Cria um novo treino
- `PUT /trainings/:id` - Atualiza um treino
- `DELETE /trainings/:id` - Deleta um treino

### Treinadores (`/treinadores`)
- `GET /treinadores` - Lista todos os treinadores
- `GET /treinadores/:id` - Busca um treinador específico
- `POST /treinadores` - Cria um novo treinador
- `PUT /treinadores/:id` - Atualiza um treinador
- `DELETE /treinadores/:id` - Deleta um treinador

## 🔐 Autenticação

O interceptor de requisições está preparado para adicionar tokens de autenticação:

```typescript
// Em api.ts
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

Para implementar autenticação:
1. Descomente o código no arquivo `services/api.ts`
2. Instale o AsyncStorage: `npx expo install @react-native-async-storage/async-storage`
3. Armazene o token após o login

## 🐛 Tratamento de Erros

Os serviços já incluem tratamento de erros básico. Erros são logados no console e propagados para serem tratados nas telas.

### Exemplo de Tratamento na Tela

```typescript
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setError(null);
    const data = await clientesService.getAll();
    setData(data);
  } catch (err) {
    setError('Erro ao carregar dados. Verifique sua conexão.');
  }
};
```

## 📱 Telas Integradas

### AlunosScreen
- ✅ Carrega clientes da API
- ✅ Exibe loading state
- ✅ Exibe error state com retry
- ✅ Exibe empty state
- ✅ Pull to refresh

### ExerciciosScreen
- ✅ Carrega exercícios da API
- ✅ Exibe loading state
- ✅ Exibe error state com retry
- ✅ Exibe empty state
- ✅ Pull to refresh
- ✅ Filtro por categoria

## 🔄 Próximos Passos

1. **Implementar autenticação completa**
   - Tela de login
   - Armazenamento de token
   - Refresh token

2. **Integrar DashScreen**
   - Buscar estatísticas da API
   - Exibir dados reais do usuário

3. **Implementar CRUD completo**
   - Telas de criação/edição de clientes
   - Telas de criação/edição de exercícios
   - Telas de criação/edição de treinos

4. **Adicionar cache e otimizações**
   - Implementar cache local
   - Otimizar requisições
   - Adicionar paginação

5. **Implementar Socket.IO**
   - Notificações em tempo real
   - Sincronização de dados

## 🧪 Testando a Integração

1. **Inicie o back-end:**
   ```bash
   cd HighTraining-BACK
   npm run dev
   ```

2. **Configure a URL da API** no arquivo `config/env.ts`

3. **Inicie o app:**
   ```bash
   cd personal-front
   npm start
   ```

4. **Teste as funcionalidades:**
   - Navegue até a tela de Alunos
   - Puxe para baixo para atualizar
   - Verifique se os dados são carregados da API

## 📝 Notas Importantes

- O back-end usa a porta `3232` por padrão
- Certifique-se de que o CORS está habilitado no back-end
- Para desenvolvimento, use o IP da sua máquina ao invés de localhost em dispositivos físicos
- Os logs das requisições aparecem no console do app

## 🆘 Problemas Comuns

### "Network Error" ou "Connection Refused"
- Verifique se o back-end está rodando
- Verifique se a URL da API está correta
- Em dispositivos físicos, use o IP da máquina ao invés de localhost
- Verifique se o firewall não está bloqueando a conexão

### "404 Not Found"
- Verifique se a rota existe no back-end
- Verifique se o caminho da rota está correto

### "CORS Error"
- Certifique-se de que o CORS está habilitado no back-end
- O back-end já tem `app.use(cors())` configurado

## 📚 Recursos Adicionais

- [Documentação do Axios](https://axios-http.com/)
- [Documentação do React Native](https://reactnative.dev/)
- [Documentação do Expo](https://docs.expo.dev/)

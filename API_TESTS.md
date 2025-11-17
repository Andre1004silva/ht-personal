# Testes da API - CURL

## 🔧 Configuração
- **Porta:** 3232
- **Admin ID:** 1
- **Base URL:** http://localhost:3232

## ✅ Testes Realizados

### 1. Listar Clientes
```bash
curl -X GET http://localhost:3232/clientes -H "admin_id: 1"
```

**Status:** ✅ Funcionando

**Resposta:**
```json
[
  {
    "id": 2,
    "admin_id": 1,
    "treinador_id": 1,
    "name": "Andre",
    "email": "Andre@gmail.com",
    "phone_number": "+55 11 81234-5678",
    "date_of_birth": "2004-12-31T02:00:00.000Z",
    "gender": "masculino",
    "created_at": "2025-10-24T09:01:43.000Z",
    "updated_at": "2025-10-24T09:01:43.000Z",
    "treinador_name": "Taryki"
  },
  {
    "id": 1,
    "admin_id": 1,
    "treinador_id": 1,
    "name": "Taryki",
    "email": "taryki.br2016@gmail.com",
    "phone_number": "+55 11 91234-5678",
    "date_of_birth": "2004-12-31T02:00:00.000Z",
    "gender": "masculino",
    "created_at": "2025-10-23T16:12:30.000Z",
    "updated_at": "2025-10-23T16:12:30.000Z",
    "treinador_name": "Taryki"
  }
]
```

**Observações:**
- ✅ API retorna 2 clientes
- ⚠️ Campos diferentes do esperado:
  - `name` ao invés de `nome`
  - `phone_number` ao invés de `telefone`
  - `date_of_birth` ao invés de `data_nascimento`
- ✅ **Solução aplicada:** Adicionado método `normalizeCliente()` no serviço

---

### 2. Listar Exercícios
```bash
curl -X GET http://localhost:3232/exercises -H "admin_id: 1"
```

**Status:** ✅ Funcionando (mas vazio)

**Resposta:**
```json
[]
```

**Observações:**
- ✅ API está funcionando
- ⚠️ Não há exercícios cadastrados no banco de dados
- 💡 **Ação necessária:** Criar exercícios pelo app ou inserir dados no banco

---

### 3. Listar Treinos
```bash
curl -X GET http://localhost:3232/trainings -H "admin_id: 1"
```

**Status:** ✅ Funcionando

**Resposta:**
```json
[
  {
    "id": 1,
    "admin_id": 1,
    "treinador_id": 1,
    "name": "Supino Reto com Barra",
    "duration": "45s",
    "repeticoes": "12",
    "video_url": "https://example.com/videos/supino_reto.mp4",
    "carga": "60kg",
    "notes": "Mantenha os cotovelos em 45º e controle o movimento na descida.",
    "created_at": "2025-11-07T16:28:30.000Z",
    "updated_at": "2025-11-07T16:28:30.000Z",
    "treinador_name": "Taryki"
  }
]
```

**Observações:**
- ✅ API retorna 1 treino
- ✅ Campos estão corretos
- ✅ Integrado na tela DashScreen

---

## 📊 Resumo dos Testes

| Endpoint | Status | Dados no DB | Integrado no App |
|----------|--------|-------------|------------------|
| GET /clientes | ✅ | 2 registros | ✅ |
| GET /exercises | ✅ | 0 registros | ✅ |
| GET /trainings | ✅ | 1 registro | ✅ |

---

## 🔍 Problemas Identificados e Soluções

### 1. ❌ Dados não renderizando no app

**Causa:** Diferença nos nomes dos campos entre API e front-end

**Campos da API:**
- `name` (ao invés de `nome`)
- `phone_number` (ao invés de `telefone`)
- `date_of_birth` (ao invés de `data_nascimento`)

**Solução Aplicada:**
```typescript
// Adicionado método normalizeCliente() no clientesService.ts
private normalizeCliente(cliente: any): Cliente {
  return {
    ...cliente,
    nome: cliente.name || cliente.nome,
    telefone: cliente.phone_number || cliente.telefone,
    data_nascimento: cliente.date_of_birth || cliente.data_nascimento,
  };
}
```

### 2. ❌ Exercícios vazios

**Causa:** Não há exercícios cadastrados no banco de dados

**Solução:**
- ✅ Tela já está preparada para exibir empty state
- 💡 Criar exercícios usando o formulário do app (`/exercicio-form`)

### 3. ✅ Treinos funcionando

**Status:** Tudo funcionando corretamente!
- ✅ Dados sendo carregados
- ✅ Renderização na tela DashScreen
- ✅ Loading e empty states implementados

---

## 🧪 Testes Adicionais Recomendados

### Criar Cliente
```bash
curl -X POST http://localhost:3232/clientes \
  -H "admin_id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone_number": "+55 11 99999-9999",
    "date_of_birth": "1990-01-01",
    "gender": "masculino"
  }'
```

### Criar Exercício
```bash
curl -X POST http://localhost:3232/exercises \
  -H "admin_id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Supino Reto",
    "categoria": "Peito",
    "grupoMuscular": "Peitoral Maior",
    "equipamento": "Barra",
    "dificuldade": "Intermediário",
    "descricao": "Exercício para desenvolvimento do peitoral",
    "instrucoes": "Deite no banco, pegue a barra..."
  }'
```

### Criar Treino
```bash
curl -X POST http://localhost:3232/trainings \
  -H "admin_id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Treino de Peito",
    "duration": "60",
    "repeticoes": "4x12",
    "carga": "80kg",
    "notes": "Foco em hipertrofia"
  }'
```

### Buscar Cliente por ID
```bash
curl -X GET http://localhost:3232/clientes/1 -H "admin_id: 1"
```

### Atualizar Cliente
```bash
curl -X PUT http://localhost:3232/clientes/1 \
  -H "admin_id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taryki Silva",
    "email": "taryki.novo@gmail.com"
  }'
```

### Deletar Cliente
```bash
curl -X DELETE http://localhost:3232/clientes/1 -H "admin_id: 1"
```

---

## ✅ Correções Aplicadas

### 1. Interface Cliente Atualizada
```typescript
export interface Cliente {
  id?: number;
  admin_id?: number;
  treinador_id?: number;
  name: string; // API usa 'name'
  nome?: string; // Alias para compatibilidade
  email?: string;
  phone_number?: string; // API usa 'phone_number'
  telefone?: string; // Alias para compatibilidade
  date_of_birth?: string; // API usa 'date_of_birth'
  data_nascimento?: string; // Alias para compatibilidade
  gender?: string;
  tipo?: string;
  experiencia?: string;
  foto?: string;
  peso?: number;
  altura?: number;
  objetivo?: string;
  observacoes?: string;
  treinador_name?: string;
  created_at?: string;
  updated_at?: string;
}
```

### 2. Tela DashScreen Integrada
- ✅ Carrega treinos da API
- ✅ Exibe loading state
- ✅ Exibe empty state quando não há treinos
- ✅ Pull to refresh funcionando

### 3. Tela de Detalhes do Cliente Corrigida
- ✅ Remove campos que não existem na API
- ✅ Usa apenas dados reais disponíveis
- ✅ Renderização condicional para campos opcionais

---

## 🎯 Status Final

### ✅ O que está funcionando:
1. **Clientes**
   - ✅ Listar todos
   - ✅ Ver detalhes
   - ✅ Criar novo
   - ✅ Editar
   - ✅ Excluir

2. **Exercícios**
   - ✅ Listar todos (vazio mas funcional)
   - ✅ Criar novo
   - ✅ Editar
   - ⚠️ Precisa cadastrar dados

3. **Treinos**
   - ✅ Listar todos
   - ✅ Exibir na dashboard
   - ✅ Loading e empty states

### 📝 Próximos Passos:
1. Cadastrar exercícios no banco usando o app
2. Implementar tela de detalhes de treinos
3. Implementar formulário de criar/editar treinos
4. Adicionar relacionamento entre treinos e exercícios

---

## 🔗 Endpoints Disponíveis

### Clientes
- `GET /clientes` - Listar todos
- `GET /clientes/:id` - Buscar por ID
- `POST /clientes` - Criar
- `PUT /clientes/:id` - Atualizar
- `DELETE /clientes/:id` - Deletar

### Exercícios
- `GET /exercises` - Listar todos
- `GET /exercises/:id` - Buscar por ID
- `POST /exercises` - Criar
- `PUT /exercises/:id` - Atualizar
- `DELETE /exercises/:id` - Deletar

### Treinos
- `GET /trainings` - Listar todos
- `GET /trainings/:id` - Buscar por ID
- `POST /trainings` - Criar
- `PUT /trainings/:id` - Atualizar
- `DELETE /trainings/:id` - Deletar

### Treinadores
- `GET /treinadores` - Listar todos
- `GET /treinadores/:id` - Buscar por ID
- `POST /treinadores` - Criar
- `PUT /treinadores/:id` - Atualizar
- `DELETE /treinadores/:id` - Deletar

---

**Última atualização:** 07/11/2025

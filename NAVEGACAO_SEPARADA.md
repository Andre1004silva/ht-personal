# Navegação Separada - Personal vs Aluno

## 📋 Resumo da Implementação

A navegação do app foi reestruturada para suportar **duas áreas distintas** baseadas no tipo de usuário autenticado:

- **PersonalStack** → Para Personal Trainers
- **AlunoStack** → Para Alunos

O roteamento é **automático** e baseado no campo `userType` retornado pela autenticação JWT.

---

## 🗂️ Estrutura de Arquivos

```
personal-front/
├── app/
│   └── index.tsx              # Roteador principal (decide qual stack renderizar)
├── navigation/
│   ├── PersonalStack.tsx      # Navegação do Personal Trainer
│   └── AlunoStack.tsx         # Navegação do Aluno
├── screens/
│   ├── personal/              # Telas do Personal
│   │   ├── DashScreen.tsx
│   │   ├── AlunosScreen.tsx
│   │   ├── TreinosScreen.tsx
│   │   ├── ExerciciosScreen.tsx
│   │   └── PerfilScreen.tsx
│   └── student/               # Telas do Aluno
│       ├── StudentDashScreen.tsx
│       ├── StudentWorkoutScreen.tsx
│       └── StudentProfileScreen.tsx
└── contexts/
    └── AuthContext.tsx        # Gerencia autenticação e userType
```

---

## 🔄 Fluxo de Navegação

### 1. Login (`app/login.tsx`)
O usuário faz login informando:
- Email
- Senha
- Tipo de usuário (`personal` ou `aluno`)

O backend retorna:
```json
{
  "user": { ... },
  "token": "jwt_token",
  "userType": "personal" | "aluno"
}
```

### 2. Armazenamento
O `AuthContext` salva no `AsyncStorage`:
- `@HighTraining:token`
- `@HighTraining:user`
- `@HighTraining:userType`

### 3. Roteamento Condicional (`app/index.tsx`)

```tsx
export default function Home() {
  const { user, userType, loading } = useAuth();

  // Verifica autenticação
  if (loading) return <LoadingScreen />;
  if (!user) router.replace('/login');

  // Roteamento baseado no tipo de usuário
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {userType === 'aluno' ? <AlunoStack /> : <PersonalStack />}
    </>
  );
}
```

### 4. Stacks de Navegação

#### PersonalStack
Gerencia 5 telas com navegação por tabs:
- Dashboard
- Alunos
- Treinos
- Exercícios
- Perfil

#### AlunoStack
Por enquanto renderiza o `StudentDashScreen`, que já possui navegação integrada para:
- Dashboard
- Treinos
- Perfil

> **Nota**: Quando as telas `StudentWorkoutScreen` e `StudentProfileScreen` forem totalmente implementadas, você pode expandir o `AlunoStack` para gerenciar a navegação de forma similar ao `PersonalStack`.

---

## 🎨 Componentes Compartilhados

### BottomNavigation
O componente de navegação inferior suporta ambos os tipos de usuário:

```tsx
<BottomNavigation 
  activeTab={activeTab} 
  onTabChange={setActiveTab}
  userType="personal" // ou "student"
/>
```

**Tabs do Personal:**
- Início, Alunos, Treinos, Exercícios, Perfil

**Tabs do Aluno:**
- Início, Treinos, Perfil

---

## 🔒 Segurança

- O `userType` é validado no backend durante o login
- O JWT contém informações sobre o tipo de usuário
- O token é validado em todas as requisições
- Logout limpa todos os dados do `AsyncStorage`

---

## 🚀 Como Testar

### 1. Iniciar o app
```bash
npm start
# ou
expo start --dev-client
```

### 2. Login como Personal Trainer
- Email: `personal@example.com`
- Tipo: **Personal**
- Resultado: Renderiza `PersonalStack` com 5 tabs

### 3. Login como Aluno
- Email: `aluno@example.com`
- Tipo: **Aluno**
- Resultado: Renderiza `AlunoStack` com 3 tabs

---

## 📝 Próximos Passos (Opcional)

### Expandir AlunoStack
Se quiser separar completamente as telas do aluno:

1. Implementar completamente `StudentWorkoutScreen` e `StudentProfileScreen`
2. Modificar `AlunoStack.tsx`:

```tsx
export default function AlunoStack() {
  const [activeTab, setActiveTab] = useState<StudentTabType>('dash');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dash':
        return <StudentDashScreen />;
      case 'treinos':
        return <StudentWorkoutScreen />;
      case 'perfil':
        return <StudentProfileScreen />;
    }
  };

  return (
    <View className="flex-1">
      {renderScreen()}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userType="student"
      />
    </View>
  );
}
```

### Adicionar Navegação em Stack
Se precisar de navegação entre telas (não apenas tabs), instale:

```bash
npm install @react-navigation/native-stack
```

E crie navegadores stack:

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function PersonalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashScreen} />
      <Stack.Screen name="AlunoDetails" component={AlunoDetailsScreen} />
      {/* ... outras telas */}
    </Stack.Navigator>
  );
}
```

---

## ✅ Checklist de Implementação

- [x] Criar `navigation/PersonalStack.tsx`
- [x] Criar `navigation/AlunoStack.tsx`
- [x] Modificar `app/index.tsx` com roteamento condicional
- [x] Manter `AuthContext` com `userType`
- [x] Preservar telas existentes
- [x] Manter `BottomNavigation` com suporte a ambos tipos

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '../navigation/PersonalStack'"
- Verifique se a pasta `navigation/` foi criada corretamente
- Confirme que os arquivos `PersonalStack.tsx` e `AlunoStack.tsx` existem

### Usuário sempre vai para PersonalStack
- Verifique se o backend está retornando `userType: "aluno"` corretamente
- Confirme que o `AsyncStorage` está salvando `@HighTraining:userType`

### Tela em branco após login
- Verifique o console para erros de importação
- Confirme que o `AuthContext` está carregando corretamente
- Verifique se o token JWT é válido

---

## 📚 Referências

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [AuthContext Pattern](https://kentcdodds.com/blog/authentication-in-react-applications)

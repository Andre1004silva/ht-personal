import { Stack, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PersonalStack from '../navigation/PersonalStack';
import AlunoStack from '../navigation/AlunoStack';

/**
 * Home - Componente principal que decide qual stack renderizar
 * 
 * Renderiza PersonalStack ou AlunoStack baseado no tipo de usuário
 * logado (armazenado no AuthContext via JWT e AsyncStorage).
 */
export default function Home() {
  const { user, userType, loading } = useAuth();

  // Verifica autenticação
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  // Se não estiver autenticado, não renderiza nada (vai redirecionar)
  if (!user) {
    return null;
  }

  // Roteamento condicional baseado no tipo de usuário
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {userType === 'aluno' ? <AlunoStack /> : <PersonalStack />}
    </>
  );
}

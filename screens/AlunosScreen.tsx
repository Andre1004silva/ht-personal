import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Dados mockados dos alunos
const alunos = [
  {
    id: 1,
    nome: 'Richard Smith',
    tipo: 'Hipertrofia',
    experiencia: '2 anos',
    foto: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    id: 2,
    nome: 'Kasandra Lilo',
    tipo: 'Fisioterapia',
    experiencia: '3 meses',
    foto: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 6,
    nome: 'Chris Heria',
    tipo: 'Emagrecimento',
    experiencia: '6 meses',
    foto: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 5,
    nome: 'Kasandra Lilo',
    tipo: 'Fisioterapia',
    experiencia: '3 meses',
    foto: 'https://randomuser.me/api/portraits/women/2.jpg'
  },
  {
    id: 3,
    nome: 'Chris Heria',
    tipo: 'Emagrecimento',
    experiencia: '6 meses',
    foto: 'https://randomuser.me/api/portraits/men/3.jpg'
  },
  {
    id: 4,
    nome: 'Ronald Chief',
    tipo: 'Hipertrofia + Emagrecimento',
    experiencia: '1 ano',
    foto: 'https://randomuser.me/api/portraits/men/4.jpg'
  }
];

export default function AlunosScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <ScrollView 
      className="flex-1 bg-[#0B1120] px-2 z-[1]" 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="white"
          colors={['white']}
          progressBackgroundColor="white"
        />
      }
    >
      {alunos.map((aluno) => (
        <TouchableOpacity
          key={aluno.id}
          className="bg-[#1E3A8A] px-2 py-4 flex-row items-center"
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => router.push(`/aluno-details?id=${aluno.id}`)}
        >
          {/* Foto do aluno */}
          <View className="mr-4">
            <Image
              source={{ uri: aluno.foto }}
              style={styles.avatar}
            />
          </View>

          {/* Informações do aluno */}
          <View className="flex-1">
            <Text className="text-white text-lg font-bold mb-1">{aluno.nome}</Text>
            <Text className="text-gray-300 text-sm mb-1">{aluno.tipo}</Text>
            <Text className="text-[#3B82F6] text-sm font-semibold">{aluno.experiencia}</Text>
          </View>

          {/* Ícone de seta */}
          <ChevronRight color="#93C5FD" size={24} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 140,
    paddingBottom: 100,
    paddingVertical: 16,
    gap: 16,
  },
  card: {
    width: '100%',
    borderRadius: 24, // Bordas arredondadas (rounded-3xl)
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32, // Circular
  },
});

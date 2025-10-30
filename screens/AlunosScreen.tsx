import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import { ChevronRight } from 'lucide-react-native';

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
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

  return (
    <View className="flex-1">
      <ScrollView 
      className="flex-1 bg-[#0B1120] px-2 z-[1]" 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6', '#93C5FD']}
          progressBackgroundColor="#141c30"
          progressViewOffset={120}
        />
      }
    >
      {alunos.map((aluno) => (
        <TouchableOpacity
          key={aluno.id}
          className="px-2 py-4 flex-row items-center"
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
    <RefreshSplash 
      visible={showRefreshSplash} 
      scale={splashScale} 
      opacity={splashOpacity} 
    />
  </View>
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
    backgroundColor: '#141c30',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

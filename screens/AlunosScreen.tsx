import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
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

  return (
    <ScrollView className="flex-1 bg-[#0B1F1F] px-6 py-6" contentContainerStyle={styles.scrollContent}>
      {alunos.map((aluno) => (
        <TouchableOpacity
          key={aluno.id}
          className="bg-[#1A3333] px-6 py-4 flex-row items-center"
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
            <Text className="text-[#C4F82A] text-sm font-semibold">{aluno.experiencia}</Text>
          </View>

          {/* Ícone de seta */}
          <ChevronRight color="#C4F82A" size={24} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16, // Espaçamento entre os cards
  },
  card: {
    borderRadius: 24, // Bordas arredondadas (rounded-3xl)
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 150, 0.2)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32, // Circular
  },
});

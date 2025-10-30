import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';

type Exercicio = {
  id: string;
  nome: string;
  categoria: string;
  grupoMuscular: string;
  equipamento: string;
  dificuldade: 'Iniciante' | 'Intermediário' | 'Avançado';
  imagem: any;
};

export default function ExerciciosScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'todos' | 'peito' | 'costas' | 'pernas' | 'ombros' | 'bracos'>('todos');
  
  const exercicios: Exercicio[] = [
    {
      id: '1',
      nome: 'Supino Reto',
      categoria: 'Peito',
      grupoMuscular: 'Peitoral Maior',
      equipamento: 'Barra',
      dificuldade: 'Intermediário',
      imagem: require('../assets/images/desenvolvimento.jpeg'),
    },
    {
      id: '2',
      nome: 'Agachamento Livre',
      categoria: 'Pernas',
      grupoMuscular: 'Quadríceps',
      equipamento: 'Barra',
      dificuldade: 'Avançado',
      imagem: require('../assets/images/prancha.jpeg'),
    },
    {
      id: '3',
      nome: 'Remada Curvada',
      categoria: 'Costas',
      grupoMuscular: 'Dorsal',
      equipamento: 'Barra',
      dificuldade: 'Intermediário',
      imagem: require('../assets/images/costas.jpeg'),
    },
    {
      id: '4',
      nome: 'Desenvolvimento Militar',
      categoria: 'Ombros',
      grupoMuscular: 'Deltóide',
      equipamento: 'Barra',
      dificuldade: 'Intermediário',
      imagem: require('../assets/images/desenvolvimento.jpeg'),
    },
    {
      id: '5',
      nome: 'Rosca Direta',
      categoria: 'Braços',
      grupoMuscular: 'Bíceps',
      equipamento: 'Barra',
      dificuldade: 'Iniciante',
      imagem: require('../assets/images/prancha.jpeg'),
    },
    {
      id: '6',
      nome: 'Tríceps Testa',
      categoria: 'Braços',
      grupoMuscular: 'Tríceps',
      equipamento: 'Barra',
      dificuldade: 'Iniciante',
      imagem: require('../assets/images/costas.jpeg'),
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'Iniciante':
        return '#3B82F6';
      case 'Intermediário':
        return '#2563EB';
      case 'Avançado':
        return '#93C5FD';
      default:
        return '#9CA3AF';
    }
  };

  const filteredExercicios = activeCategory === 'todos' 
    ? exercicios 
    : exercicios.filter(ex => ex.categoria.toLowerCase() === activeCategory);

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Category Tabs */}
      <View className="px-4" style={{ paddingTop: 140 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
        <TouchableOpacity
          onPress={() => setActiveCategory('todos')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'todos' ? 'bg-[#3B82F6]' : 'bg-[#1E3A8A]'}`}
        >
          <Text className="font-semibold text-white">Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('peito')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'peito' ? 'bg-[#3B82F6]' : 'bg-[#1E3A8A]'}`}
        >
          <Text className="font-semibold text-white">Peito</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('costas')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'costas' ? 'bg-[#3B82F6]' : 'bg-[#1E3A8A]'}`}
        >
          <Text className="font-semibold text-white">Costas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('pernas')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'pernas' ? 'bg-[#3B82F6]' : 'bg-[#1E3A8A]'}`}
        >
          <Text className="font-semibold text-white">Pernas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('ombros')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'ombros' ? 'bg-[#3B82F6]' : 'bg-[#1E3A8A]'}`}
        >
          <Text className="font-semibold text-white">Ombros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('bracos')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'bracos' ? 'bg-[#3B82F6]' : 'bg-[#1E3A8A]'}`}
        >
          <Text className="font-semibold text-white">Braços</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Action Bar */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity className="flex-row items-center gap-2 bg-[#1E3A8A] px-4 py-2 rounded-lg">
          <Ionicons name="filter" size={20} color="#3B82F6" />
          <Text className="text-white font-medium">Filtros</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-2 bg-[#1E3A8A] px-4 py-2 rounded-lg">
          <Ionicons name="search" size={20} color="#3B82F6" />
          <Text className="text-white font-medium">Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#3B82F6] px-4 py-2 rounded-lg">
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Exercícios List */}
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
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
        <View className="pb-6">
          {filteredExercicios.map((exercicio) => (
            <TouchableOpacity
              key={exercicio.id}
              className="bg-[#1E3A8A] rounded-2xl mb-4 overflow-hidden"
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/exercicio-details?id=${exercicio.id}`)}
            >
              <View className="flex-row">
                {/* Imagem */}
                <Image
                  source={exercicio.imagem}
                  style={styles.exerciseImage}
                  resizeMode="cover"
                />

                {/* Informações */}
                <View className="flex-1 p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
                      {exercicio.nome}
                    </Text>
                    <View 
                      className="px-2 py-1 rounded-full ml-2"
                      style={{ backgroundColor: `${getDificuldadeColor(exercicio.dificuldade)}20` }}
                    >
                      <Text 
                        className="text-xs font-semibold"
                        style={{ color: getDificuldadeColor(exercicio.dificuldade) }}
                      >
                        {exercicio.dificuldade}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="body-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm ml-1">{exercicio.grupoMuscular}</Text>
                  </View>

                  <View className="flex-row items-center mb-3">
                    <Ionicons name="barbell-outline" size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm ml-1">{exercicio.equipamento}</Text>
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity 
                      className="flex-1 bg-[#3B82F6] rounded-lg py-2 items-center"
                      onPress={(e) => {
                        e.stopPropagation();
                        // Adicionar ao treino
                      }}
                    >
                      <Text className="text-white text-xs font-semibold">Adicionar ao Treino</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="bg-[#0B1120] rounded-lg px-3 py-2 items-center justify-center"
                      onPress={(e) => {
                        e.stopPropagation();
                        // Ver detalhes
                      }}
                    >
                      <Ionicons name="chevron-forward" size={16} color="#93C5FD" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseImage: {
    width: 120,
    height: '100%',
    minHeight: 140,
  },
});

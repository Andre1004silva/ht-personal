import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { exercisesService, Exercise } from '@/services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ExerciciosScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [exercicios, setExercicios] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const [activeCategory, setActiveCategory] = useState<'todos' | 'peito' | 'costas' | 'pernas' | 'ombros' | 'bracos'>('todos');

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Imagem padrão para exercícios sem imagem
  const defaultImage = require('@/assets/images/desenvolvimento.jpeg');

  // Carrega os exercícios da API
  const loadExercicios = async () => {
    try {
      setError(null);
      const data = await exercisesService.getAll();
      setExercicios(data);
    } catch (err) {
      console.error('Erro ao carregar exercícios:', err);
      setError('Erro ao carregar exercícios. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    loadExercicios();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    await loadExercicios();
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'Iniciante':
        return '#60A5FA';
      case 'Intermediário':
        return '#60A5FA';
      case 'Avançado':
        return '#93C5FD';
      default:
        return '#9CA3AF';
    }
  };

  // Nota: O backend atual não tem campo 'categoria', então mostramos todos
  // Quando o backend for atualizado para incluir categorias, descomentar o filtro
  const filteredExercicios = activeCategory === 'todos' 
    ? exercicios 
    : exercicios.filter(ex => {
        // Filtro temporário baseado no nome do exercício até backend ter categoria
        const nome = (ex.nome || '').toLowerCase();
        return nome.includes(activeCategory);
      });

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Video */}
      <VideoView
        player={videoPlayer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        contentFit="cover"
        nativeControls={false}
      />
      {/* Blur Overlay */}
      <BlurView
        intensity={50}
        tint="dark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      
      {/* Category Tabs */}
      <View className="px-4" style={{ paddingTop: 140 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
        <TouchableOpacity
          onPress={() => setActiveCategory('todos')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'todos' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
        >
          <Text className="font-semibold text-white">Todos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('peito')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'peito' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
        >
          <Text className="font-semibold text-white">Peito</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('costas')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'costas' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
        >
          <Text className="font-semibold text-white">Costas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('pernas')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'pernas' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
        >
          <Text className="font-semibold text-white">Pernas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('ombros')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'ombros' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
        >
          <Text className="font-semibold text-white">Ombros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveCategory('bracos')}
          className={`px-5 py-2 rounded-full ${activeCategory === 'bracos' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
        >
          <Text className="font-semibold text-white">Braços</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Action Bar */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity className="flex-row items-center gap-2 bg-[#141c30] px-4 py-2 rounded-lg">
          <Ionicons name="filter" size={20} color="#60A5FA" />
          <Text className="text-white font-medium">Filtros</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-2 bg-[#141c30] px-4 py-2 rounded-lg">
          <Ionicons name="search" size={20} color="#60A5FA" />
          <Text className="text-white font-medium">Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-[#60A5FA] px-4 py-2 rounded-lg"
          onPress={() => router.push('/exercicio-form' as any)}
        >
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
            tintColor="#60A5FA"
            colors={['#60A5FA', '#93C5FD']}
            progressBackgroundColor="#141c30"
            progressViewOffset={120}
          />
        }
      >
        {/* Loading State */}
        {loading && (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text className="text-white mt-4">Carregando exercícios...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text className="text-white mt-4 text-center px-8">{error}</Text>
            <TouchableOpacity 
              className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
              onPress={loadExercicios}
            >
              <Text className="text-white font-semibold">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredExercicios.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="barbell-outline" size={64} color="#9CA3AF" />
            <Text className="text-white mt-4 text-center px-8">
              Nenhum exercício encontrado
            </Text>
          </View>
        )}

        <View className="pb-6">
          {!loading && !error && filteredExercicios.map((exercicio) => (
            <LiquidGlassCard key={exercicio.id} style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/exercicio-details?id=${exercicio.id}`)}
              >
                <View className="flex-row">
                  {/* Imagem */}
                  <Image
                    source={exercicio.imagem ? { uri: exercicio.imagem } : defaultImage}
                    style={styles.exerciseImage}
                    resizeMode="cover"
                  />

                  {/* Informações */}
                  <View className="flex-1 p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
                        {exercicio.nome}
                      </Text>
                      {exercicio.carga && (
                        <View 
                          className="px-2 py-1 rounded-full ml-2"
                          style={{ backgroundColor: '#60A5FA20' }}
                        >
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: '#60A5FA' }}
                          >
                            {exercicio.carga}
                          </Text>
                        </View>
                      )}
                    </View>

                    {exercicio.series && (
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="repeat-outline" size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1">{exercicio.series} séries</Text>
                      </View>
                    )}

                    {exercicio.repeticoes && (
                      <View className="flex-row items-center mb-3">
                        <Ionicons name="fitness-outline" size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1">{exercicio.repeticoes} reps</Text>
                      </View>
                    )}

                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        className="flex-1 bg-[#60A5FA] rounded-lg py-2 items-center"
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
            </LiquidGlassCard>
          ))}
        </View>
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
  exerciseImage: {
    width: 120,
    height: '100%',
    minHeight: 140,
  },
});

import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import { ChevronRight } from 'lucide-react-native';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { clientesService, Cliente } from '@/services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AlunosScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [alunos, setAlunos] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega os clientes da API
  const loadClientes = async () => {
    try {
      setError(null);
      const data = await clientesService.getAll();
      setAlunos(data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    loadClientes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    await loadClientes();
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

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

      {/* Botão Adicionar Cliente */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 w-16 h-16 bg-[#60A5FA] rounded-full items-center justify-center z-10"
        style={{
          shadowColor: '#60A5FA',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push('/aluno-form' as any)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
      
      <ScrollView 
      className="flex-1 px-2" 
      contentContainerStyle={styles.scrollContent}
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
          <Text className="text-white mt-4">Carregando clientes...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-white mt-4 text-center px-8">{error}</Text>
          <TouchableOpacity 
            className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
            onPress={loadClientes}
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && alunos.length === 0 && (
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons name="people-outline" size={64} color="#9CA3AF" />
          <Text className="text-white mt-4 text-center px-8">
            Nenhum cliente encontrado
          </Text>
        </View>
      )}

      {/* Clientes List */}
      {!loading && !error && alunos.map((aluno) => (
        <LiquidGlassCard key={aluno.id} style={{ marginBottom: 16 }}>
          <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
            onPress={() => router.push(`/aluno-details?id=${aluno.id}`)}
          >
            {/* Foto do aluno */}
            <View className="mr-4">
              <View 
                style={styles.avatar}
                className="bg-[#60A5FA] items-center justify-center"
              >
                <Text className="text-white text-2xl font-bold">
                  {aluno.nome?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            </View>

            {/* Informações do aluno */}
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-1">{aluno.nome}</Text>
              <Text className="text-gray-300 text-sm mb-1">{aluno.email || 'Sem email'}</Text>
              <Text className="text-[#60A5FA] text-sm font-semibold">{aluno.telefone || 'Sem telefone'}</Text>
            </View>

            {/* Ícone de seta */}
            <ChevronRight color="#93C5FD" size={24} />
          </TouchableOpacity>
        </LiquidGlassCard>
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
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

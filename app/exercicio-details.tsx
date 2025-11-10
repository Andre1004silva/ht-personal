import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Circle, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';
import { exercisesService, Exercise } from '@/services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ExercicioDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [exercicio, setExercicio] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Imagem padrão
  const defaultImage = require('../assets/images/desenvolvimento.jpeg');

  useEffect(() => {
    loadExercicio();
  }, [params.id]);

  const loadExercicio = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exercisesService.getById(Number(params.id));
      setExercicio(data);
    } catch (err) {
      console.error('Erro ao carregar exercício:', err);
      setError('Erro ao carregar dados do exercício');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este exercício?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await exercisesService.delete(Number(params.id));
              Alert.alert('Sucesso', 'Exercício excluído com sucesso!');
              router.back();
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir exercício');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/exercicio-form?id=${params.id}` as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white mt-4">Carregando...</Text>
      </View>
    );
  }

  if (error || !exercicio) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-white mt-4 text-center">{error || 'Exercício não encontrado'}</Text>
        <TouchableOpacity 
          className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
          onPress={loadExercicio}
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="mt-2"
          onPress={() => router.back()}
        >
          <Text className="text-[#93C5FD]">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Design - Estrelas e Nebulosa */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {/* Nebula Gradients */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.25)', 'rgba(59, 130, 246, 0.15)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: -150,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: 300,
          }}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(96, 165, 250, 0.2)', 'rgba(37, 99, 235, 0.12)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: screenHeight * 0.4,
            left: -180,
            width: 500,
            height: 500,
            borderRadius: 250,
          }}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(59, 130, 246, 0.18)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            bottom: -100,
            right: -150,
            width: 450,
            height: 450,
            borderRadius: 225,
          }}
        />
        
        {/* Star Field */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.3 }}>
          <Defs>
            <RadialGradient id="starGrad" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {[...Array(60)].map((_, i) => {
            const size = Math.random() * 3 + 0.5;
            return (
              <Circle
                key={`star-${i}`}
                cx={Math.random() * screenWidth}
                cy={Math.random() * screenHeight}
                r={size}
                fill="url(#starGrad)"
                opacity={Math.random() * 0.8 + 0.2}
              />
            );
          })}
        </Svg>
        
        {/* Star Shapes */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.15 }}>
          {[...Array(15)].map((_, i) => {
            const x = Math.random() * screenWidth;
            const y = Math.random() * screenHeight;
            const size = Math.random() * 8 + 4;
            const points = [
              [x, y - size],
              [x + size * 0.3, y - size * 0.3],
              [x + size, y],
              [x + size * 0.3, y + size * 0.3],
              [x, y + size],
              [x - size * 0.3, y + size * 0.3],
              [x - size, y],
              [x - size * 0.3, y - size * 0.3],
            ].map(p => p.join(',')).join(' ');
            
            return (
              <Polygon
                key={`star-shape-${i}`}
                points={points}
                fill="#60A5FA"
                opacity={Math.random() * 0.6 + 0.4}
              />
            );
          })}
        </Svg>
        
        {/* Glowing Particles */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.2 }}>
          {[...Array(30)].map((_, i) => (
            <Circle
              key={`glow-${i}`}
              cx={Math.random() * screenWidth}
              cy={Math.random() * screenHeight}
              r={Math.random() * 5 + 2}
              fill="#93C5FD"
              opacity={Math.random() * 0.7 + 0.3}
            />
          ))}
        </Svg>
      </View>
      
      <ScrollView className="flex-1">
        {/* Header com imagem */}
        <View style={styles.headerContainer}>
          <Image
            source={exercicio.imagem ? { uri: exercicio.imagem } : defaultImage}
            style={styles.headerImage}
            resizeMode="cover"
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(11, 17, 32, 0.8)', '#0B1120']}
            style={styles.gradient}
          />

          {/* Botão voltar */}
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Badge de carga */}
          {exercicio.carga && (
            <View 
              className="absolute top-14 right-5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#60A5FA20' }}
            >
              <Text 
                className="text-sm font-bold"
                style={{ color: '#60A5FA' }}
              >
                {exercicio.carga}
              </Text>
            </View>
          )}

          {/* Informações sobre a imagem */}
          <View style={styles.headerInfo}>
            <Text className="text-white text-3xl font-bold mb-2">
              {exercicio.nome}
            </Text>
            <View className="flex-row gap-3">
              {exercicio.series && (
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                  <Ionicons name="repeat-outline" size={16} color="white" />
                  <Text className="text-white text-sm font-semibold">{exercicio.series} séries</Text>
                </View>
              )}
              {exercicio.repeticoes && (
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                  <Ionicons name="fitness-outline" size={16} color="white" />
                  <Text className="text-white text-sm font-semibold">{exercicio.repeticoes}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* Descrição */}
          {(exercicio.descricao || exercicio.notes) && (
            <LiquidGlassCard style={{ marginBottom: 16 }}>
              <Text className="text-white text-lg font-bold mb-3">Observações</Text>
              <Text className="text-gray-300 text-sm leading-6">
                {exercicio.descricao || exercicio.notes}
              </Text>
            </LiquidGlassCard>
          )}

          {/* Informações do Exercício */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Detalhes</Text>
            
            {exercicio.series && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Séries</Text>
                <Text className="text-white text-base">{exercicio.series}</Text>
              </View>
            )}

            {exercicio.repeticoes && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Repetições</Text>
                <Text className="text-white text-base">{exercicio.repeticoes}</Text>
              </View>
            )}

            {exercicio.carga && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Carga</Text>
                <Text className="text-white text-base">{exercicio.carga}</Text>
              </View>
            )}

            {exercicio.treinador_name && (
              <View>
                <Text className="text-gray-400 text-xs mb-1">Treinador</Text>
                <Text className="text-white text-base">{exercicio.treinador_name}</Text>
              </View>
            )}
          </LiquidGlassCard>

          {/* Botões de Ação */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity 
              className="flex-1 bg-[#60A5FA] rounded-2xl py-4 items-center flex-row justify-center gap-2"
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#EF4444',
                borderRadius: 24,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    height: 320,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  dividerBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
});

import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Line, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TreinoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data - em produção, você buscaria os dados baseado no ID
  const treino = {
    id: params.id,
    titulo: 'Home Chest Workout\n(No Equipment)',
    duracao: '45 min',
    calorias: '381 Cal',
    imagem: require('../assets/images/desenvolvimento.jpeg'),
    nivel: 'AAA Hard',
    progresso: '0%',
    focoArea: 'Chest',
    descricao: 'Building chest muscles doesn\'t have to be complicated, these 8 bodyweight exercises that will give you excellent results at home. No equipment.',
    trainer: {
      nome: 'Chris Heria',
      cargo: 'High Intensity Fitness Trainer',
      experiencia: '7 years experience',
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    rating: 4.6,
    totalRatings: 174,
    exercicios: [
      {
        id: 1,
        nome: 'Push Ups',
        repeticoes: '20 reps',
        imagem: require('../assets/images/desenvolvimento.jpeg'),
      },
      {
        id: 2,
        nome: '90° Hold',
        duracao: '20 sec',
        imagem: require('../assets/images/prancha.jpeg'),
      },
      {
        id: 3,
        nome: 'Push Ups in a Circle',
        repeticoes: '8 reps both directions',
        imagem: require('../assets/images/costas.jpeg'),
      },
    ],
  };

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
  trainerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  reviewerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
});

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Design - Linhas Diagonais e Orbs Dinâmicos */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {/* Diagonal Lines Pattern */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.04 }}>
          {[...Array(30)].map((_, i) => (
            <Line
              key={`diag-${i}`}
              x1={i * 40 - 200}
              y1={0}
              x2={i * 40 + screenHeight}
              y2={screenHeight}
              stroke="#60A5FA"
              strokeWidth="2"
            />
          ))}
        </Svg>
        
        {/* Dynamic Gradient Orbs */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.35)', 'rgba(59, 130, 246, 0.12)', 'transparent']}
          style={{
            position: 'absolute',
            top: 80,
            right: -120,
            width: 380,
            height: 380,
            borderRadius: 190,
          }}
        />
        
        <LinearGradient
          colors={['rgba(96, 165, 250, 0.3)', 'rgba(96, 165, 250, 0.1)', 'transparent']}
          style={{
            position: 'absolute',
            top: 350,
            left: -140,
            width: 420,
            height: 420,
            borderRadius: 210,
          }}
        />
        
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.28)', 'rgba(37, 99, 235, 0.08)', 'transparent']}
          style={{
            position: 'absolute',
            bottom: 150,
            right: -90,
            width: 340,
            height: 340,
            borderRadius: 170,
          }}
        />
        
        {/* Pulsing Circles */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.12 }}>
          <Defs>
            <RadialGradient id="pulseGrad" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#60A5FA" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {[...Array(12)].map((_, i) => (
            <Circle
              key={`pulse-${i}`}
              cx={Math.random() * screenWidth}
              cy={Math.random() * screenHeight}
              r={Math.random() * 80 + 40}
              fill="url(#pulseGrad)"
            />
          ))}
        </Svg>
        
        {/* Accent Dots */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.2 }}>
          {[...Array(25)].map((_, i) => (
            <Circle
              key={`accent-${i}`}
              cx={Math.random() * screenWidth}
              cy={Math.random() * screenHeight}
              r={Math.random() * 4 + 1.5}
              fill="#60A5FA"
            />
          ))}
        </Svg>
      </View>
      
      <ScrollView className="flex-1">
        {/* Header com imagem */}
        <View style={styles.headerContainer}>
          <Image
            source={treino.imagem}
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

          {/* Informações sobre a imagem */}
          <View style={styles.headerInfo}>
            <Text className="text-white text-2xl font-bold mb-3">
              {treino.titulo}
            </Text>
            <View className="flex-row gap-3">
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{treino.duracao}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="flame-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{treino.calorias}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* About Section */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">About</Text>
            <Text className="text-gray-300 text-sm leading-6 mb-4">
              {treino.descricao}
            </Text>

            {/* Stats */}
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Level</Text>
                <Text className="text-[#60A5FA] text-sm font-bold">{treino.nivel}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Progress</Text>
                <Text className="text-[#2563EB] text-sm font-bold">{treino.progresso}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Focus Area</Text>
                <Text className="text-white text-sm font-bold">{treino.focoArea}</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Guide */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <TouchableOpacity className="flex-row items-center justify-between">
              <Text className="text-white text-base font-semibold">Guide</Text>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* Rating */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-white text-5xl font-bold mr-4">{treino.rating}</Text>
                <View>
                  <View className="flex-row mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={12}
                        color={star <= Math.floor(treino.rating) ? "#60A5FA" : "#444"}
                      />
                    ))}
                  </View>
                  <Text className="text-gray-400 text-xs">{treino.totalRatings} Ratings</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text className="text-[#93C5FD] text-sm font-semibold">See all</Text>
              </TouchableOpacity>
            </View>

            {/* Review exemplo */}
            <View className="flex-row">
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/45.jpg' }}
                style={styles.reviewerPhoto}
              />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white text-sm font-bold">David Lewis</Text>
                  <Text className="text-gray-400 text-xs">3d ago</Text>
                </View>
                <Text className="text-gray-300 text-xs leading-5">
                  I had such an amazing session with Chris. He instantly picked up on the level of my fitness and adjusted the workout to suit me...
                </Text>
              </View>
              <View className="bg-[#60A5FA] w-10 h-10 rounded-lg items-center justify-center ml-2">
                <Text className="text-white text-sm font-bold">4.8</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Exercises */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-1">Exercises</Text>
            <Text className="text-gray-400 text-xs mb-4">8 STEPS • 4 SETS</Text>

            {treino.exercicios.map((exercicio, index) => (
              <TouchableOpacity
                key={exercicio.id}
                className="flex-row items-center mb-3"
              >
                <Image
                  source={exercicio.imagem}
                  style={styles.exerciseImage}
                />
                <View className="flex-1 ml-3">
                  <Text className="text-[#60A5FA] text-sm font-bold mb-1">
                    {exercicio.nome}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {exercicio.repeticoes || exercicio.duracao}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </LiquidGlassCard>

          {/* Botões de Ação */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity className="flex-1 bg-[#60A5FA] rounded-2xl py-4 items-center flex-row justify-center gap-2">
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: '#141c30',
              borderRadius: 24,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: 'bold' }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

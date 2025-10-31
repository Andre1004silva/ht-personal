import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AlunoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data - em produção, você buscaria os dados baseado no ID
  const aluno = {
    id: params.id,
    nome: 'Richard Smith',
    tipo: 'Hipertrofia',
    experiencia: '2 anos',
    foto: 'https://randomuser.me/api/portraits/men/1.jpg',
    idade: 28,
    peso: '82 kg',
    altura: '1.78 m',
    objetivo: 'Ganho de massa muscular',
    frequencia: '5x por semana',
    dataInicio: '15 Jan 2023',
    telefone: '+55 11 98765-4321',
    email: 'richard.smith@email.com',
    stats: {
      treinos: 156,
      frequencia: 92,
      evolucao: '+8kg',
    },
    proximoTreino: {
      titulo: 'Treino de Peito e Tríceps',
      data: 'Hoje',
      horario: '18:00',
    },
    ultimosTreinos: [
      {
        id: 1,
        titulo: 'Treino de Costas',
        data: 'Ontem',
        duracao: '55 min',
        concluido: true,
      },
      {
        id: 2,
        titulo: 'Treino de Pernas',
        data: '2 dias atrás',
        duracao: '60 min',
        concluido: true,
      },
      {
        id: 3,
        titulo: 'Treino de Ombros',
        data: '3 dias atrás',
        duracao: '45 min',
        concluido: false,
      },
    ],
    medidas: [
      { parte: 'Peitoral', valor: '105 cm', evolucao: '+3 cm' },
      { parte: 'Braço', valor: '38 cm', evolucao: '+2 cm' },
      { parte: 'Coxa', valor: '58 cm', evolucao: '+4 cm' },
      { parte: 'Cintura', valor: '82 cm', evolucao: '-2 cm' },
    ],
  };

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Design - Mesh Gradient e Partículas */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {/* Mesh Gradient Layers */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.25)', 'transparent', 'rgba(139, 92, 246, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: screenHeight * 0.5,
          }}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(96, 165, 250, 0.18)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: screenHeight * 0.3,
            left: 0,
            right: 0,
            height: screenHeight * 0.4,
          }}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(37, 99, 235, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: screenHeight * 0.4,
          }}
        />
        
        {/* Floating Particles */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.15 }}>
          <Defs>
            <SvgLinearGradient id="particleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.5" />
            </SvgLinearGradient>
          </Defs>
          {[...Array(50)].map((_, i) => {
            const size = Math.random() * 6 + 2;
            return (
              <Circle
                key={`particle-${i}`}
                cx={Math.random() * screenWidth}
                cy={Math.random() * screenHeight}
                r={size}
                fill="url(#particleGrad)"
                opacity={Math.random() * 0.7 + 0.3}
              />
            );
          })}
        </Svg>
        
        {/* Accent Rectangles */}
        <Svg width={screenWidth} height={screenHeight} style={{ position: 'absolute', opacity: 0.05 }}>
          {[...Array(8)].map((_, i) => (
            <Rect
              key={`rect-${i}`}
              x={Math.random() * screenWidth}
              y={Math.random() * screenHeight}
              width={Math.random() * 100 + 50}
              height={Math.random() * 100 + 50}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              transform={`rotate(${Math.random() * 45}, ${Math.random() * screenWidth}, ${Math.random() * screenHeight})`}
            />
          ))}
        </Svg>
      </View>
      
      <ScrollView className="flex-1">
        {/* Header com foto */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: aluno.foto }}
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
            <Text className="text-white text-3xl font-bold mb-2">
              {aluno.nome}
            </Text>
            <Text className="text-[#3B82F6] text-lg font-semibold mb-3">
              {aluno.tipo}
            </Text>
            <View className="flex-row gap-3">
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{aluno.experiencia}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{aluno.frequencia}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* Estatísticas */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-4">Estatísticas</Text>
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text className="text-[#3B82F6] text-3xl font-bold">{aluno.stats.treinos}</Text>
                <Text className="text-gray-400 text-xs mt-1">Treinos</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-1 items-center">
                <Text className="text-[#3B82F6] text-3xl font-bold">{aluno.stats.frequencia}%</Text>
                <Text className="text-gray-400 text-xs mt-1">Frequência</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-1 items-center">
                <Text className="text-[#93C5FD] text-3xl font-bold">{aluno.stats.evolucao}</Text>
                <Text className="text-gray-400 text-xs mt-1">Evolução</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Informações Pessoais */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Informações Pessoais</Text>
            
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Idade</Text>
              <Text className="text-white text-base">{aluno.idade} anos</Text>
            </View>

            <View className="flex-row gap-4 mb-3">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Peso</Text>
                <Text className="text-white text-base">{aluno.peso}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Altura</Text>
                <Text className="text-white text-base">{aluno.altura}</Text>
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Objetivo</Text>
              <Text className="text-white text-base">{aluno.objetivo}</Text>
            </View>

            <View>
              <Text className="text-gray-400 text-xs mb-1">Cliente desde</Text>
              <Text className="text-white text-base">{aluno.dataInicio}</Text>
            </View>
          </LiquidGlassCard>

          {/* Contato */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Contato</Text>
            
            <TouchableOpacity className="flex-row items-center mb-3">
              <View className="bg-[#3B82F6]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="call-outline" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Telefone</Text>
                <Text className="text-white text-base">{aluno.telefone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <View className="bg-[#3B82F6]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Email</Text>
                <Text className="text-white text-base">{aluno.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* Próximo Treino */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Próximo Treino</Text>
            <View className="bg-[#0B1120] rounded-xl p-4">
              <Text className="text-white text-base font-bold mb-2">
                {aluno.proximoTreino.titulo}
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="calendar-outline" size={16} color="#93C5FD" />
                  <Text className="text-gray-300 text-sm">{aluno.proximoTreino.data}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={16} color="#93C5FD" />
                  <Text className="text-gray-300 text-sm">{aluno.proximoTreino.horario}</Text>
                </View>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Últimos Treinos */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Últimos Treinos</Text>
              <TouchableOpacity>
                <Text className="text-[#93C5FD] text-sm font-semibold">Ver todos</Text>
              </TouchableOpacity>
            </View>

            {aluno.ultimosTreinos.map((treino, index) => (
              <TouchableOpacity
                key={treino.id}
                className="flex-row items-center py-3"
                style={index < aluno.ultimosTreinos.length - 1 && styles.treinoItem}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  treino.concluido ? 'bg-[#3B82F6]/20' : 'bg-gray-600/20'
                }`}>
                  <Ionicons 
                    name={treino.concluido ? "checkmark-circle" : "close-circle"} 
                    size={24} 
                    color={treino.concluido ? "#3B82F6" : "#9CA3AF"} 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold mb-1">
                    {treino.titulo}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {treino.data} • {treino.duracao}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
              </TouchableOpacity>
            ))}
          </LiquidGlassCard>

          {/* Medidas */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Medidas Corporais</Text>
            
            {aluno.medidas.map((medida, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between py-3"
                style={index < aluno.medidas.length - 1 && styles.medidaItem}
              >
                <Text className="text-gray-400 text-sm">{medida.parte}</Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-white text-base font-semibold">{medida.valor}</Text>
                  <Text className={`text-sm font-semibold ${
                    medida.evolucao.startsWith('+') ? 'text-[#3B82F6]' : 'text-[#93C5FD]'
                  }`}>
                    {medida.evolucao}
                  </Text>
                </View>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Botões de Ação */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity className="flex-1 bg-[#3B82F6] rounded-2xl py-4 items-center flex-row justify-center gap-2">
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
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5
            }}>
              <Ionicons name="calendar-outline" size={20} color="#93C5FD" />
              <Text className="text-white text-base font-bold">Agendar</Text>
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
  divider: {
    width: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  treinoItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  medidaItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
});

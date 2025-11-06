import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Circle, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ExercicioDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTreino, setSelectedTreino] = useState<string | null>(null);

  // Mock data - em produção, você buscaria os dados baseado no ID
  const exercicio = {
    id: params.id,
    nome: 'Supino Reto',
    categoria: 'Peito',
    grupoMuscular: 'Peitoral Maior',
    equipamento: 'Barra',
    dificuldade: 'Intermediário',
    imagem: require('../assets/images/desenvolvimento.jpeg'),
    descricao: 'O supino reto é um exercício fundamental para o desenvolvimento do peitoral maior. Executado com barra, permite trabalhar com cargas elevadas e é excelente para ganho de força e massa muscular.',
    musculos: [
      { nome: 'Peitoral Maior', tipo: 'Principal' },
      { nome: 'Tríceps', tipo: 'Secundário' },
      { nome: 'Deltóide Anterior', tipo: 'Secundário' },
    ],
    instrucoes: [
      'Deite-se no banco com os pés apoiados no chão',
      'Pegue a barra com pegada pronada, mãos um pouco mais afastadas que a largura dos ombros',
      'Retire a barra do suporte e posicione sobre o peito',
      'Desça a barra de forma controlada até próximo ao peito',
      'Empurre a barra de volta à posição inicial',
      'Mantenha os cotovelos em ângulo de 45° em relação ao corpo',
    ],
    dicas: [
      'Mantenha as escápulas retraídas durante todo o movimento',
      'Não deixe a barra quicar no peito',
      'Expire ao empurrar a barra para cima',
      'Mantenha os pés firmes no chão',
    ],
    variacoes: [
      { nome: 'Supino Inclinado', foco: 'Peitoral Superior' },
      { nome: 'Supino Declinado', foco: 'Peitoral Inferior' },
      { nome: 'Supino com Halteres', foco: 'Amplitude de movimento' },
    ],
  };

  // Mock de treinos disponíveis
  const treinosDisponiveis = [
    { id: '1', nome: 'Treino A - Peito e Tríceps', exercicios: 8 },
    { id: '2', nome: 'Treino B - Costas e Bíceps', exercicios: 7 },
    { id: '3', nome: 'Treino C - Pernas', exercicios: 9 },
    { id: '4', nome: 'Treino D - Ombros', exercicios: 6 },
  ];

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'Iniciante':
        return '#60A5FA';
      case 'Intermediário':
        return '#2563EB';
      case 'Avançado':
        return '#93C5FD';
      default:
        return '#9CA3AF';
    }
  };

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
            source={exercicio.imagem}
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

          {/* Badge de dificuldade */}
          <View 
            className="absolute top-14 right-5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${getDificuldadeColor(exercicio.dificuldade)}20` }}
          >
            <Text 
              className="text-sm font-bold"
              style={{ color: getDificuldadeColor(exercicio.dificuldade) }}
            >
              {exercicio.dificuldade}
            </Text>
          </View>

          {/* Informações sobre a imagem */}
          <View style={styles.headerInfo}>
            <Text className="text-white text-3xl font-bold mb-2">
              {exercicio.nome}
            </Text>
            <View className="flex-row gap-3">
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="body-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{exercicio.grupoMuscular}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="barbell-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{exercicio.equipamento}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* Descrição */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Sobre o Exercício</Text>
            <Text className="text-gray-300 text-sm leading-6">
              {exercicio.descricao}
            </Text>
          </LiquidGlassCard>

          {/* Músculos Trabalhados */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Músculos Trabalhados</Text>
            {exercicio.musculos.map((musculo, index) => (
              <View 
                key={index}
                className="flex-row items-center justify-between py-2"
                style={index < exercicio.musculos.length - 1 && styles.dividerBottom}
              >
                <Text className="text-white text-base">{musculo.nome}</Text>
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: musculo.tipo === 'Principal' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)' 
                  }}
                >
                  <Text 
                    className="text-xs font-semibold"
                    style={{ color: musculo.tipo === 'Principal' ? '#60A5FA' : '#2563EB' }}
                  >
                    {musculo.tipo}
                  </Text>
                </View>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Instruções */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Como Executar</Text>
            {exercicio.instrucoes.map((instrucao, index) => (
              <View key={index} className="flex-row mb-3">
                <View className="bg-[#60A5FA] w-6 h-6 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">{index + 1}</Text>
                </View>
                <Text className="text-gray-300 text-sm flex-1 leading-6">{instrucao}</Text>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Dicas */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Dicas Importantes</Text>
            {exercicio.dicas.map((dica, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#60A5FA" style={{ marginRight: 8, marginTop: 2 }} />
                <Text className="text-gray-300 text-sm flex-1 leading-6">{dica}</Text>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Variações */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Variações</Text>
            {exercicio.variacoes.map((variacao, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between py-3"
                style={index < exercicio.variacoes.length - 1 && styles.dividerBottom}
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold mb-1">{variacao.nome}</Text>
                  <Text className="text-gray-400 text-xs">{variacao.foco}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
              </TouchableOpacity>
            ))}
          </LiquidGlassCard>

          {/* Adicionar ao Treino */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Adicionar ao Treino</Text>
            <Text className="text-gray-400 text-sm mb-4">
              Selecione um treino para adicionar este exercício
            </Text>
            
            {treinosDisponiveis.map((treino) => (
              <TouchableOpacity
                key={treino.id}
                className={`rounded-xl p-4 mb-3 flex-row items-center justify-between ${
                  selectedTreino === treino.id ? 'bg-[#60A5FA]/20 border-2 border-[#60A5FA]' : 'bg-[#0B1120]'
                }`}
                onPress={() => setSelectedTreino(treino.id)}
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold mb-1">{treino.nome}</Text>
                  <Text className="text-gray-400 text-xs">{treino.exercicios} exercícios</Text>
                </View>
                {selectedTreino === treino.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#60A5FA" />
                )}
              </TouchableOpacity>
            ))}

            {selectedTreino && (
              <TouchableOpacity className="bg-[#60A5FA] rounded-xl py-4 items-center mt-2">
                <Text className="text-white text-base font-bold">Confirmar Adição</Text>
              </TouchableOpacity>
            )}
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

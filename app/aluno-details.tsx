import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useState, useEffect } from 'react';
import { clientesService, Cliente } from '@/services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AlunoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [aluno, setAluno] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega os dados do cliente
  useEffect(() => {
    loadCliente();
  }, [params.id]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getById(Number(params.id));
      setAluno(data);
    } catch (err) {
      console.error('Erro ao carregar cliente:', err);
      setError('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientesService.delete(Number(params.id));
              Alert.alert('Sucesso', 'Cliente excluído com sucesso!');
              router.back();
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir cliente');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/aluno-form?id=${params.id}` as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white mt-4">Carregando...</Text>
      </View>
    );
  }

  if (error || !aluno) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-white mt-4 text-center">{error || 'Cliente não encontrado'}</Text>
        <TouchableOpacity 
          className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
          onPress={loadCliente}
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

  // Imagem padrão caso não tenha foto
  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(aluno.nome || 'Cliente') + '&size=400&background=60A5FA&color=fff';

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
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
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
              stroke="#60A5FA"
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
            source={{ uri: aluno.foto || defaultAvatar }}
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
            {aluno.gender && (
              <Text className="text-[#60A5FA] text-lg font-semibold mb-3">
                {aluno.gender}
              </Text>
            )}
            <View className="flex-row gap-3">
              {aluno.treinador_name && (
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                  <Ionicons name="person-outline" size={16} color="white" />
                  <Text className="text-white text-sm font-semibold">{aluno.treinador_name}</Text>
                </View>
              )}
              {aluno.telefone && (
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                  <Ionicons name="call-outline" size={16} color="white" />
                  <Text className="text-white text-sm font-semibold">Contato</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* Informações Pessoais */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Informações do Cliente</Text>
            
            {aluno.gender && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Gênero</Text>
                <Text className="text-white text-base">{aluno.gender}</Text>
              </View>
            )}

            {aluno.data_nascimento && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Data de Nascimento</Text>
                <Text className="text-white text-base">{new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}</Text>
              </View>
            )}

            {aluno.treinador_name && (
              <View>
                <Text className="text-gray-400 text-xs mb-1">Treinador</Text>
                <Text className="text-white text-base">{aluno.treinador_name}</Text>
              </View>
            )}
          </LiquidGlassCard>

          {/* Contato */}
          {(aluno.telefone || aluno.email) && (
            <LiquidGlassCard style={{ marginBottom: 16 }}>
              <Text className="text-white text-lg font-bold mb-3">Contato</Text>
              
              {aluno.telefone && (
                <View className="flex-row items-center mb-3">
                  <View className="bg-[#60A5FA]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="call-outline" size={20} color="#60A5FA" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">Telefone</Text>
                    <Text className="text-white text-base">{aluno.telefone}</Text>
                  </View>
                </View>
              )}

              {aluno.email && (
                <View className="flex-row items-center">
                  <View className="bg-[#60A5FA]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="mail-outline" size={20} color="#60A5FA" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">Email</Text>
                    <Text className="text-white text-base">{aluno.email}</Text>
                  </View>
                </View>
              )}
            </LiquidGlassCard>
          )}


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
                gap: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
              }}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold">Excluir</Text>
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

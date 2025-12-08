import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useState, useEffect } from 'react';
import { clientesService, Cliente, clienteEstatisticService, ClienteEstatistic } from '@/services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

export default function AlunoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [aluno, setAluno] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do formulário de medidas
  const [medidas, setMedidas] = useState({
    weight: '',
    height: '',
    muscle_mass_percentage: '',
    notes: '',
    ombro: '',
    torax: '',
    braco_esquerdo: '',
    braco_direito: '',
    antebraco_esquerdo: '',
    antebraco_direito: '',
    punho: '',
    cintura: '',
    abdome: '',
    quadril: '',
    coxa_esquerda: '',
    coxa_direita: '',
    panturrilha_esquerda: '',
    panturrilha_direita: '',
  });
  
  // Estado para lista de medidas e edição
  const [listaMedidas, setListaMedidas] = useState<ClienteEstatistic[]>([]);
  const [editandoMedidaId, setEditandoMedidaId] = useState<number | null>(null);
  const [loadingMedidas, setLoadingMedidas] = useState(false);
  const [mostrarFormMedidas, setMostrarFormMedidas] = useState(false);

  // Carrega os dados do cliente e medidas
  useEffect(() => {
    loadCliente();
    loadMedidas();
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

  // Carrega as medidas do cliente
  const loadMedidas = async () => {
    try {
      setLoadingMedidas(true);
      const data = await clienteEstatisticService.getAll({ cliente_id: Number(params.id) });
      setListaMedidas(data);
    } catch (err) {
      console.error('Erro ao carregar medidas:', err);
    } finally {
      setLoadingMedidas(false);
    }
  };

  // Salva ou atualiza medida
  const handleSaveMedida = async () => {
    try {
      // Converte strings vazias para null
      const payload: any = {
        cliente_id: Number(params.id),
      };

      // Adiciona apenas campos preenchidos
      Object.keys(medidas).forEach((key) => {
        const value = medidas[key as keyof typeof medidas];
        if (value && value.trim() !== '') {
          payload[key] = key === 'notes' ? value : parseFloat(value);
        }
      });

      if (editandoMedidaId) {
        // Atualizar medida existente
        await clienteEstatisticService.update(editandoMedidaId, payload);
        Alert.alert('Sucesso', 'Medida atualizada com sucesso!');
      } else {
        // Criar nova medida
        await clienteEstatisticService.create(payload);
        Alert.alert('Sucesso', 'Medida criada com sucesso!');
      }

      // Limpa o formulário e recarrega a lista
      resetFormMedidas();
      loadMedidas();
    } catch (err: any) {
      console.error('Erro ao salvar medida:', err);
      Alert.alert('Erro', err?.response?.data?.message || 'Erro ao salvar medida');
    }
  };

  // Edita uma medida existente
  const handleEditMedida = (medida: ClienteEstatistic) => {
    setEditandoMedidaId(medida.id || null);
    setMostrarFormMedidas(true);
    setMedidas({
      weight: medida.weight?.toString() || '',
      height: medida.height?.toString() || '',
      muscle_mass_percentage: medida.muscle_mass_percentage?.toString() || '',
      notes: medida.notes || '',
      ombro: medida.ombro?.toString() || '',
      torax: medida.torax?.toString() || '',
      braco_esquerdo: medida.braco_esquerdo?.toString() || '',
      braco_direito: medida.braco_direito?.toString() || '',
      antebraco_esquerdo: medida.antebraco_esquerdo?.toString() || '',
      antebraco_direito: medida.antebraco_direito?.toString() || '',
      punho: medida.punho?.toString() || '',
      cintura: medida.cintura?.toString() || '',
      abdome: medida.abdome?.toString() || '',
      quadril: medida.quadril?.toString() || '',
      coxa_esquerda: medida.coxa_esquerda?.toString() || '',
      coxa_direita: medida.coxa_direita?.toString() || '',
      panturrilha_esquerda: medida.panturrilha_esquerda?.toString() || '',
      panturrilha_direita: medida.panturrilha_direita?.toString() || '',
    });
  };

  // Deleta uma medida
  const handleDeleteMedida = (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir esta medida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await clienteEstatisticService.delete(id);
              Alert.alert('Sucesso', 'Medida excluída com sucesso!');
              loadMedidas();
            } catch (err) {
              Alert.alert('Erro', 'Erro ao excluir medida');
            }
          },
        },
      ]
    );
  };

  // Reseta o formulário de medidas
  const resetFormMedidas = () => {
    setEditandoMedidaId(null);
    setMostrarFormMedidas(false);
    setMedidas({
      weight: '',
      height: '',
      muscle_mass_percentage: '',
      notes: '',
      ombro: '',
      torax: '',
      braco_esquerdo: '',
      braco_direito: '',
      antebraco_esquerdo: '',
      antebraco_direito: '',
      punho: '',
      cintura: '',
      abdome: '',
      quadril: '',
      coxa_esquerda: '',
      coxa_direita: '',
      panturrilha_esquerda: '',
      panturrilha_direita: '',
    });
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
  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(aluno.name || 'Cliente') + '&size=400&background=60A5FA&color=fff';

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
            source={{ uri: defaultAvatar }}
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
              {aluno.name}
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
              {aluno.phone_number && (
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
            <Text className="text-white text-lg font-bold mb-3">Informações do Aluno</Text>
            
            {aluno.gender && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Gênero</Text>
                <Text className="text-white text-base">{aluno.gender}</Text>
              </View>
            )}

            {aluno.age && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Idade</Text>
                <Text className="text-white text-base">{aluno.age || 'N/A'}</Text>
              </View>
            )}

            {aluno.date_of_birth && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Data de Nascimento</Text>
                <Text className="text-white text-base">{new Date(aluno.date_of_birth).toLocaleDateString('pt-BR')}</Text>
              </View>
            )}

            {aluno.treinador_name && (
              <View>
                <Text className="text-gray-400 text-xs mb-1">Treinador</Text>
                <Text className="text-white text-base">{aluno.treinador_name}</Text>
              </View>
            )}
          </LiquidGlassCard>
          
          {/* Medidas - Histórico e Formulário */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-bold">Medidas Corporais</Text>
              {!mostrarFormMedidas && (
                <TouchableOpacity 
                  onPress={() => setMostrarFormMedidas(true)}
                  className="bg-[#60A5FA] px-4 py-2 rounded-lg flex-row items-center gap-2"
                >
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-white text-sm font-semibold">Nova Medida</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Loading State */}
            {loadingMedidas && (
              <View className="py-4">
                <ActivityIndicator size="small" color="#60A5FA" />
                <Text className="text-white text-center mt-2 text-sm">Carregando medidas...</Text>
              </View>
            )}

            {/* Histórico de Medidas */}
            {!loadingMedidas && listaMedidas.length > 0 && !mostrarFormMedidas && (
              <View>
                {listaMedidas.map((medida, index) => (
                  <View 
                    key={medida.id} 
                    style={[styles.medidaItem, index === listaMedidas.length - 1 && { borderBottomWidth: 0 }]}
                    className="py-3"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-white text-base font-semibold">
                          {new Date(medida.created_at || '').toLocaleDateString('pt-BR')}
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mt-2">
                          {medida.weight && (
                            <Text className="text-gray-400 text-xs">Peso: {medida.weight}kg</Text>
                          )}
                          {medida.height && (
                            <Text className="text-gray-400 text-xs">Altura: {medida.height}cm</Text>
                          )}
                          {medida.muscle_mass_percentage && (
                            <Text className="text-gray-400 text-xs">MM: {medida.muscle_mass_percentage}%</Text>
                          )}
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <TouchableOpacity 
                          onPress={() => handleEditMedida(medida)}
                          className="bg-[#60A5FA]/20 p-2 rounded-lg"
                        >
                          <Ionicons name="create-outline" size={18} color="#60A5FA" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => handleDeleteMedida(medida.id!)}
                          className="bg-red-500/20 p-2 rounded-lg"
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {medida.notes && (
                      <Text className="text-gray-400 text-xs mt-1" numberOfLines={2}>{medida.notes}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Mensagem quando não há medidas */}
            {!loadingMedidas && listaMedidas.length === 0 && !mostrarFormMedidas && (
              <View className="py-6 items-center">
                <Ionicons name="fitness-outline" size={48} color="#6B7280" />
                <Text className="text-gray-400 text-center mt-3">Nenhuma medida registrada ainda</Text>
                <Text className="text-gray-500 text-center text-xs mt-1">Clique em "Nova Medida" para começar</Text>
              </View>
            )}

            {/* Formulário de Medidas */}
            {mostrarFormMedidas && (
              <View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white text-base font-semibold">
                    {editandoMedidaId ? 'Editar Medida' : 'Nova Medida'}
                  </Text>
                  <TouchableOpacity onPress={resetFormMedidas}>
                    <Text className="text-[#60A5FA] text-sm">Cancelar</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-gray-400 text-xs mb-4">Todos os campos são opcionais. Preencha apenas o que for relevante.</Text>
            
            {/* Dados Gerais */}
            <Text className="text-[#60A5FA] text-sm font-semibold mb-3">Dados Gerais</Text>
            
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Peso (kg)</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 75.5"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.weight}
                onChangeText={(text) => setMedidas({ ...medidas, weight: text })}
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Altura (cm)</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 175"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.height}
                onChangeText={(text) => setMedidas({ ...medidas, height: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 text-xs mb-1">% Massa Muscular</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 35.5"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.muscle_mass_percentage}
                onChangeText={(text) => setMedidas({ ...medidas, muscle_mass_percentage: text })}
              />
            </View>

            {/* Medidas Corporais - Parte Superior */}
            <Text className="text-[#60A5FA] text-sm font-semibold mb-3">Parte Superior (cm)</Text>
            
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Ombro</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 45"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.ombro}
                onChangeText={(text) => setMedidas({ ...medidas, ombro: text })}
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Tórax</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 95"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.torax}
                onChangeText={(text) => setMedidas({ ...medidas, torax: text })}
              />
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Braço Esquerdo</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 35"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.braco_esquerdo}
                  onChangeText={(text) => setMedidas({ ...medidas, braco_esquerdo: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Braço Direito</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 35"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.braco_direito}
                  onChangeText={(text) => setMedidas({ ...medidas, braco_direito: text })}
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Antebraço Esquerdo</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 28"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.antebraco_esquerdo}
                  onChangeText={(text) => setMedidas({ ...medidas, antebraco_esquerdo: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Antebraço Direito</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 28"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.antebraco_direito}
                  onChangeText={(text) => setMedidas({ ...medidas, antebraco_direito: text })}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 text-xs mb-1">Punho</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 18"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.punho}
                onChangeText={(text) => setMedidas({ ...medidas, punho: text })}
              />
            </View>

            {/* Medidas Corporais - Tronco */}
            <Text className="text-[#60A5FA] text-sm font-semibold mb-3">Tronco (cm)</Text>
            
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Cintura</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 80"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.cintura}
                onChangeText={(text) => setMedidas({ ...medidas, cintura: text })}
              />
            </View>

            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Abdômen</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 85"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.abdome}
                onChangeText={(text) => setMedidas({ ...medidas, abdome: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-400 text-xs mb-1">Quadril</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Ex: 95"
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                value={medidas.quadril}
                onChangeText={(text) => setMedidas({ ...medidas, quadril: text })}
              />
            </View>

            {/* Medidas Corporais - Parte Inferior */}
            <Text className="text-[#60A5FA] text-sm font-semibold mb-3">Parte Inferior (cm)</Text>
            
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Coxa Esquerda</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 55"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.coxa_esquerda}
                  onChangeText={(text) => setMedidas({ ...medidas, coxa_esquerda: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Coxa Direita</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 55"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.coxa_direita}
                  onChangeText={(text) => setMedidas({ ...medidas, coxa_direita: text })}
                />
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Panturrilha Esquerda</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 38"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.panturrilha_esquerda}
                  onChangeText={(text) => setMedidas({ ...medidas, panturrilha_esquerda: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Panturrilha Direita</Text>
                <TextInput
                  className="bg-white/10 text-white px-4 py-3 rounded-lg"
                  placeholder="Ex: 38"
                  placeholderTextColor="#6B7280"
                  keyboardType="decimal-pad"
                  value={medidas.panturrilha_direita}
                  onChangeText={(text) => setMedidas({ ...medidas, panturrilha_direita: text })}
                />
              </View>
            </View>

            {/* Observações */}
            <Text className="text-[#60A5FA] text-sm font-semibold mb-3">Observações</Text>
            
            <View className="mb-4">
              <Text className="text-gray-400 text-xs mb-1">Notas</Text>
              <TextInput
                className="bg-white/10 text-white px-4 py-3 rounded-lg"
                placeholder="Adicione observações sobre as medidas..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={medidas.notes}
                onChangeText={(text) => setMedidas({ ...medidas, notes: text })}
              />
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity 
              className="bg-[#60A5FA] rounded-xl py-4 items-center"
              onPress={handleSaveMedida}
            >
              <Text className="text-white text-base font-bold">{editandoMedidaId ? 'Atualizar Medida' : 'Salvar Medidas'}</Text>
            </TouchableOpacity>
              </View>
            )}
          </LiquidGlassCard>

          {/* Contato */}
          {(aluno.phone_number || aluno.email) && (
            <LiquidGlassCard style={{ marginBottom: 16 }}>
              <Text className="text-white text-lg font-bold mb-3">Contato</Text>
              
              {aluno.phone_number && (
                <View className="flex-row items-center mb-3">
                  <View className="bg-[#60A5FA]/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="call-outline" size={20} color="#60A5FA" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-xs">Telefone</Text>
                    <Text className="text-white text-base">{aluno.phone_number}</Text>
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
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LiquidGlassCard from '../components/LiquidGlassCard';
import Svg, { Line, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  trainingsService, 
  exerciseTrainingsService, 
  exercisesService, 
  clientesService,
  clientTrainingService,
  type Training,
  type ExerciseTraining,
  type Exercise,
  type Cliente
} from '../services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TreinoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [treino, setTreino] = useState<Training | null>(null);
  const [exerciciosVinculados, setExerciciosVinculados] = useState<ExerciseTraining[]>([]);
  const [todosExercicios, setTodosExercicios] = useState<Exercise[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<Cliente[]>([]);
  
  // Modais
  const [modalExerciciosVisible, setModalExerciciosVisible] = useState(false);
  const [modalAlunosVisible, setModalAlunosVisible] = useState(false);
  const [modalEditarExercicioVisible, setModalEditarExercicioVisible] = useState(false);
  
  // Dados para edição de exercício vinculado
  const [exercicioEditando, setExercicioEditando] = useState<ExerciseTraining | null>(null);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [restTime, setRestTime] = useState('');
  const [order, setOrder] = useState('');
  const [notes, setNotes] = useState('');
  
  // Busca de exercícios e alunos
  const [searchExercicio, setSearchExercicio] = useState('');
  const [searchAluno, setSearchAluno] = useState('');

  useEffect(() => {
    if (params.id) {
      loadTreinoData();
    }
  }, [params.id]);

  const loadTreinoData = async () => {
    try {
      setLoading(true);
      const treinoId = Number(params.id);
      
      // Busca dados do treino
      const treinoData = await trainingsService.getById(treinoId);
      setTreino(treinoData);
      
      // Busca exercícios vinculados ao treino
      const exercicios = await exerciseTrainingsService.getByTrainingId(treinoId);
      setExerciciosVinculados(exercicios);
    } catch (error) {
      console.error('Erro ao carregar dados do treino:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do treino');
    } finally {
      setLoading(false);
    }
  };

  const loadExercicios = async () => {
    try {
      const exercicios = await exercisesService.getAll();
      setTodosExercicios(exercicios);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de exercícios');
    }
  };

  const loadAlunos = async () => {
    try {
      if (!user?.id) return;
      const alunos = await clientesService.getAll({ treinador_id: user.id });
      setTodosAlunos(alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de alunos');
    }
  };

  const handleVincularExercicio = async (exercicio: Exercise) => {
    try {
      if (!treino?.id) return;
      
      await exerciseTrainingsService.create({
        training_id: treino.id,
        exercise_id: exercicio.id!,
        order: exerciciosVinculados.length + 1,
      });
      
      Alert.alert('Sucesso', 'Exercício vinculado ao treino com sucesso!');
      setModalExerciciosVisible(false);
      loadTreinoData();
    } catch (error: any) {
      console.error('Erro ao vincular exercício:', error);
      const message = error.response?.data?.message || 'Não foi possível vincular o exercício';
      Alert.alert('Erro', message);
    }
  };

  const handleRemoverExercicio = async (exercicioTrainingId: number) => {
    Alert.alert(
      'Confirmar Remoção',
      'Deseja remover este exercício do treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await exerciseTrainingsService.delete(exercicioTrainingId);
              Alert.alert('Sucesso', 'Exercício removido do treino!');
              loadTreinoData();
            } catch (error) {
              console.error('Erro ao remover exercício:', error);
              Alert.alert('Erro', 'Não foi possível remover o exercício');
            }
          },
        },
      ]
    );
  };

  const handleEditarExercicio = (exercicio: ExerciseTraining) => {
    setExercicioEditando(exercicio);
    setSets(exercicio.sets?.toString() || '');
    setReps(exercicio.reps?.toString() || '');
    setRestTime(exercicio.rest_time?.toString() || '');
    setOrder(exercicio.order?.toString() || '');
    setNotes(exercicio.notes || '');
    setModalEditarExercicioVisible(true);
  };

  const handleVincularAluno = async (aluno: Cliente) => {
    try {
      if (!treino?.id || !user?.id) return;
      
      await clientTrainingService.create({
        client_id: aluno.id!,
        training_id: treino.id,
        treinador_id: user.id,
      });
      
      Alert.alert('Sucesso', `Treino vinculado ao aluno ${aluno.name} com sucesso!`);
      setModalAlunosVisible(false);
    } catch (error: any) {
      console.error('Erro ao vincular treino ao aluno:', error);
      const message = error.response?.data?.message || 'Não foi possível vincular o treino ao aluno';
      Alert.alert('Erro', message);
    }
  };

  const handleDeletarTreino = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este treino? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!treino?.id) return;
              await trainingsService.delete(treino.id);
              Alert.alert('Sucesso', 'Treino excluído com sucesso!');
              router.back();
            } catch (error) {
              console.error('Erro ao excluir treino:', error);
              Alert.alert('Erro', 'Não foi possível excluir o treino');
            }
          },
        },
      ]
    );
  };

  const exerciciosFiltrados = todosExercicios.filter(ex => 
    (ex.name || ex.nome || '').toLowerCase().includes(searchExercicio.toLowerCase())
  );

  const alunosFiltrados = todosAlunos.filter(aluno => 
    aluno.name.toLowerCase().includes(searchAluno.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white mt-4">Carregando...</Text>
      </View>
    );
  }

  if (!treino) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <Text className="text-white text-lg">Treino não encontrado</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }


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
        {/* Header */}
        <View className="px-5 pt-16 pb-6">
          {/* Botão voltar */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mb-6"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Título */}
          <Text className="text-white text-3xl font-bold mb-2">
            {treino.name || treino.nome}
          </Text>
          
          {treino.duration && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={18} color="#60A5FA" />
              <Text className="text-gray-300 text-base">{treino.duration} minutos</Text>
            </View>
          )}
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* About Section */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <Text className="text-white text-lg font-bold mb-3">Informações</Text>
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">Nome</Text>
              <Text className="text-white text-base font-semibold">{treino.name || treino.nome}</Text>
            </View>
            
            {treino.duration && (
              <View className="mb-3">
                <Text className="text-gray-400 text-xs mb-1">Duração</Text>
                <Text className="text-white text-base">{treino.duration} min</Text>
              </View>
            )}
            
            {treino.notes && (
              <View>
                <Text className="text-gray-400 text-xs mb-1">Observações</Text>
                <Text className="text-gray-300 text-sm leading-6">{treino.notes}</Text>
              </View>
            )}
          </LiquidGlassCard>

          {/* Exercises */}
          <LiquidGlassCard style={{ marginBottom: 16 }}>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-lg font-bold">Exercícios</Text>
                <Text className="text-gray-400 text-xs">{exerciciosVinculados.length} exercícios</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  loadExercicios();
                  setModalExerciciosVisible(true);
                }}
                className="bg-[#60A5FA] px-4 py-2 rounded-full flex-row items-center gap-2"
              >
                <Ionicons name="add" size={18} color="white" />
                <Text className="text-white text-sm font-bold">Adicionar</Text>
              </TouchableOpacity>
            </View>

            {exerciciosVinculados.length === 0 ? (
              <View className="py-8 items-center">
                <Ionicons name="barbell-outline" size={48} color="#4B5563" />
                <Text className="text-gray-400 text-sm mt-3">Nenhum exercício vinculado</Text>
                <Text className="text-gray-500 text-xs mt-1">Toque em Adicionar para vincular exercícios</Text>
              </View>
            ) : (
              exerciciosVinculados.map((exercicio, index) => (
                <View
                  key={exercicio.id}
                  className="mb-3 p-3 bg-white/5 rounded-xl"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-2">
                        {exercicio.order && (
                          <View className="bg-[#60A5FA]/20 px-2 py-1 rounded">
                            <Text className="text-[#60A5FA] text-xs font-bold">#{exercicio.order}</Text>
                          </View>
                        )}
                        <Text className="text-white text-base font-bold flex-1">
                          {exercicio.exercise_name}
                        </Text>
                      </View>
                      
                      <View className="flex-row flex-wrap gap-2">
                        {exercicio.sets && (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="repeat" size={14} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs">{exercicio.sets} séries</Text>
                          </View>
                        )}
                        {exercicio.reps && (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="fitness" size={14} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs">{exercicio.reps} reps</Text>
                          </View>
                        )}
                        {exercicio.rest_time && (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="time" size={14} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs">{exercicio.rest_time}s descanso</Text>
                          </View>
                        )}
                      </View>
                      
                      {exercicio.notes && (
                        <Text className="text-gray-400 text-xs mt-2">{exercicio.notes}</Text>
                      )}
                    </View>
                    
                    <View className="flex-row gap-2 ml-2">
                      <TouchableOpacity 
                        onPress={() => handleEditarExercicio(exercicio)}
                        className="p-2"
                      >
                        <Ionicons name="create-outline" size={20} color="#60A5FA" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleRemoverExercicio(exercicio.id!)}
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </LiquidGlassCard>

          {/* Botões de Ação */}
          <View className="gap-3 mb-6">
            <TouchableOpacity 
              onPress={() => {
                loadAlunos();
                setModalAlunosVisible(true);
              }}
              className="bg-[#10B981] rounded-2xl py-4 items-center flex-row justify-center gap-2"
            >
              <Ionicons name="person-add" size={20} color="white" />
              <Text className="text-white text-base font-bold">Vincular a Aluno</Text>
            </TouchableOpacity>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => router.push(`/treino-form?id=${treino.id}`)}
                className="flex-1 bg-[#60A5FA] rounded-2xl py-4 items-center flex-row justify-center gap-2"
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text className="text-white text-base font-bold">Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDeletarTreino}
                style={{
                  flex: 1,
                  backgroundColor: '#141c30',
                  borderRadius: 24,
                  paddingVertical: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: 'bold' }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Adicionar Exercícios */}
      <Modal
        visible={modalExerciciosVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalExerciciosVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#0B1120] rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-5 border-b border-white/10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Adicionar Exercício</Text>
                <TouchableOpacity onPress={() => setModalExerciciosVisible(false)}>
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>
              
              <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchExercicio}
                  onChangeText={setSearchExercicio}
                  placeholder="Buscar exercício..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-white"
                />
              </View>
            </View>
            
            <ScrollView className="p-5">
              {exerciciosFiltrados.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="barbell-outline" size={48} color="#4B5563" />
                  <Text className="text-gray-400 text-sm mt-3">Nenhum exercício encontrado</Text>
                </View>
              ) : (
                exerciciosFiltrados.map((exercicio) => (
                  <TouchableOpacity
                    key={exercicio.id}
                    onPress={() => handleVincularExercicio(exercicio)}
                    className="bg-white/5 rounded-xl p-4 mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-white text-base font-bold mb-1">
                        {exercicio.name || exercicio.nome}
                      </Text>
                      <View className="flex-row gap-3">
                        {exercicio.series && (
                          <Text className="text-gray-400 text-xs">{exercicio.series} séries</Text>
                        )}
                        {exercicio.repetitions && (
                          <Text className="text-gray-400 text-xs">{exercicio.repetitions} reps</Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="add-circle" size={28} color="#60A5FA" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Vincular a Aluno */}
      <Modal
        visible={modalAlunosVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalAlunosVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#0B1120] rounded-t-3xl" style={{ maxHeight: '80%' }}>
            <View className="p-5 border-b border-white/10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Vincular a Aluno</Text>
                <TouchableOpacity onPress={() => setModalAlunosVisible(false)}>
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>
              
              <View className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                  value={searchAluno}
                  onChangeText={setSearchAluno}
                  placeholder="Buscar aluno..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-white"
                />
              </View>
            </View>
            
            <ScrollView className="p-5">
              {alunosFiltrados.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="people-outline" size={48} color="#4B5563" />
                  <Text className="text-gray-400 text-sm mt-3">Nenhum aluno encontrado</Text>
                </View>
              ) : (
                alunosFiltrados.map((aluno) => (
                  <TouchableOpacity
                    key={aluno.id}
                    onPress={() => handleVincularAluno(aluno)}
                    className="bg-white/5 rounded-xl p-4 mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-white text-base font-bold mb-1">{aluno.name}</Text>
                      {aluno.email && (
                        <Text className="text-gray-400 text-xs">{aluno.email}</Text>
                      )}
                    </View>
                    <Ionicons name="person-add" size={24} color="#10B981" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

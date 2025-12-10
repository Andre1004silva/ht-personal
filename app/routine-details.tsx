import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { 
  trainingRoutinesService, 
  trainingsService,
  routineTrainingsService,
  TrainingRoutine,
  Training,
  RoutineTraining
} from '@/services';
import { useAuth } from '@/contexts/AuthContext';

export default function RoutineDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const routineId = params.id ? Number(params.id) : null;

  const [loading, setLoading] = useState(true);
  const [routine, setRoutine] = useState<TrainingRoutine | null>(null);
  const [routineTrainings, setRoutineTrainings] = useState<RoutineTraining[]>([]);
  const [availableTrainings, setAvailableTrainings] = useState<Training[]>([]);
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [showCreateTrainingModal, setShowCreateTrainingModal] = useState(false);
  const [newTrainingName, setNewTrainingName] = useState('');
  const [newTrainingNotes, setNewTrainingNotes] = useState('');
  const [newTrainingDayOfWeek, setNewTrainingDayOfWeek] = useState('');
  const [newTrainingNumber, setNewTrainingNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    if (routineId) {
      loadRoutine();
    }
  }, [routineId]);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!routineId) {
        setError('ID da rotina não fornecido');
        return;
      }

      const data = await trainingRoutinesService.getById(routineId);
      setRoutine(data);

      // Carregar trainings vinculados a esta rotina
      await loadRoutineTrainings();

      // Carregar treinos disponíveis do treinador
      if (user?.id) {
        const trainings = await trainingsService.getAll(user.id);
        setAvailableTrainings(trainings);
      }
    } catch (err) {
      console.error('Erro ao carregar rotina:', err);
      setError('Não foi possível carregar os dados da rotina');
    } finally {
      setLoading(false);
    }
  };

  const loadRoutineTrainings = async () => {
    try {
      if (!routineId) return;
      const data = await routineTrainingsService.getAll(routineId);
      setRoutineTrainings(data);
    } catch (error) {
      console.error('Erro ao carregar treinos da rotina:', error);
    }
  };

  const handleAddTraining = async (trainingId: number) => {
    try {
      if (!routineId) return;
      
      await routineTrainingsService.create({
        routine_id: routineId,
        training_id: trainingId,
        order: routineTrainings.length + 1,
        is_active: true
      });

      Alert.alert('Sucesso', 'Treino adicionado à rotina!');
      await loadRoutineTrainings();
      setShowAddTrainingModal(false);
    } catch (error: any) {
      console.error('Erro ao adicionar treino:', error);
      const message = error?.response?.data?.message || 'Não foi possível adicionar o treino';
      Alert.alert('Erro', message);
    }
  };

  const handleCreateNewTraining = async () => {
    try {
      if (!newTrainingName.trim()) {
        Alert.alert('Atenção', 'O nome do treino é obrigatório');
        return;
      }

      if (!user?.id || !routineId) return;

      // Define day_of_week baseado no tipo da rotina
      let dayOfWeek: string | undefined;
      if (routine?.routine_type === 'Dia da semana') {
        if (!newTrainingDayOfWeek) {
          Alert.alert('Atenção', 'Selecione o dia da semana');
          return;
        }
        dayOfWeek = newTrainingDayOfWeek;
      } else if (routine?.routine_type === 'Numérico') {
        if (!newTrainingNumber) {
          Alert.alert('Atenção', 'Digite o número do treino');
          return;
        }
        dayOfWeek = `Treino ${newTrainingNumber}`;
      }

      // Criar o treino
      const newTraining = await trainingsService.create({
        name: newTrainingName,
        notes: newTrainingNotes || undefined,
        day_of_week: dayOfWeek,
        trainer_id: user.id,
      });

      // Vincular à rotina
      await routineTrainingsService.create({
        routine_id: routineId,
        training_id: newTraining.id!,
        order: routineTrainings.length + 1,
        is_active: true
      });

      Alert.alert('Sucesso', 'Treino criado e adicionado à rotina!');
      
      // Limpar formulário
      setNewTrainingName('');
      setNewTrainingNotes('');
      setNewTrainingDayOfWeek('');
      setNewTrainingNumber('');
      setShowCreateTrainingModal(false);
      
      // Recarregar dados
      await loadRoutineTrainings();
      if (user?.id) {
        const trainings = await trainingsService.getAll(user.id);
        setAvailableTrainings(trainings);
      }
    } catch (error: any) {
      console.error('Erro ao criar treino:', error);
      const message = error?.response?.data?.message || 'Não foi possível criar o treino';
      Alert.alert('Erro', message);
    }
  };

  const handleRemoveTraining = (routineTrainingId: number) => {
    Alert.alert(
      'Confirmar Remoção',
      'Tem certeza que deseja remover este treino da rotina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await routineTrainingsService.delete(routineTrainingId);
              Alert.alert('Sucesso', 'Treino removido da rotina');
              await loadRoutineTrainings();
            } catch (error) {
              console.error('Erro ao remover treino:', error);
              Alert.alert('Erro', 'Não foi possível remover o treino');
            }
          }
        }
      ]
    );
  };

  const handleDeleteRoutine = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta rotina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!routineId) return;
              await trainingRoutinesService.delete(routineId);
              Alert.alert('Sucesso', 'Rotina excluída com sucesso');
              const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
              await AsyncStorage.setItem('@HighTraining:activeTab', 'treinos');
              router.replace('/');
            } catch (error) {
              console.error('Erro ao excluir rotina:', error);
              Alert.alert('Erro', 'Não foi possível excluir a rotina');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="text-white mt-4">Carregando...</Text>
      </View>
    );
  }

  if (error || !routine) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-white mt-4 text-center">{error || 'Rotina não encontrada'}</Text>
        <TouchableOpacity
          className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
          onPress={async () => {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('@HighTraining:activeTab', 'treinos');
            router.replace('/');
          }}
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

      {/* Header */}
      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: 60 }}>
        <TouchableOpacity onPress={async () => {
          // Salva a tab ativa para voltar para TreinosScreen
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem('@HighTraining:activeTab', 'treinos');
          router.replace('/');
        }}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Detalhes da Rotina</Text>
        <TouchableOpacity onPress={() => router.push(`/routine-form?id=${routineId}` as any)}>
          <Ionicons name="create-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 mt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Informações do Cliente */}
        <LiquidGlassCard>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-sm">Cliente</Text>
            <View className="bg-[#60A5FA] px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">{routine.difficulty}</Text>
            </View>
          </View>
          <Text className="text-white text-xl font-bold">{routine.student_name}</Text>
        </LiquidGlassCard>

        {/* Objetivo e Tipo */}
        <LiquidGlassCard>
          <View className="flex-row items-center mb-3">
            <Ionicons name="trophy" size={20} color="#60A5FA" />
            <Text className="text-white font-semibold ml-2">Objetivo</Text>
          </View>
          <Text className="text-gray-300">{routine.goal}</Text>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar" size={20} color="#60A5FA" />
            <Text className="text-white font-semibold ml-2">Tipo de Rotina</Text>
          </View>
          <Text className="text-gray-300">{routine.routine_type}</Text>
        </LiquidGlassCard>

        {/* Período */}
        <LiquidGlassCard>
          <View className="flex-row items-center mb-3">
            <Ionicons name="time" size={20} color="#60A5FA" />
            <Text className="text-white font-semibold ml-2">Período</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-xs">Início</Text>
              <Text className="text-white">
                {new Date(routine.start_date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#60A5FA" />
            <View>
              <Text className="text-gray-400 text-xs">Término</Text>
              <Text className="text-white">
                {new Date(routine.end_date).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Instruções */}
        {routine.instructions && (
          <LiquidGlassCard>
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text" size={20} color="#60A5FA" />
              <Text className="text-white font-semibold ml-2">Instruções</Text>
            </View>
            <Text className="text-gray-300">{routine.instructions}</Text>
          </LiquidGlassCard>
        )}

        {/* Treinos da Rotina */}
        <LiquidGlassCard>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="barbell" size={20} color="#60A5FA" />
              <Text className="text-white font-semibold ml-2">Treinos</Text>
            </View>
            <TouchableOpacity
              className="bg-[#60A5FA] px-4 py-2 rounded-lg"
              onPress={() => setShowAddTrainingModal(true)}
            >
              <Text className="text-white font-semibold">Adicionar</Text>
            </TouchableOpacity>
          </View>

          {routineTrainings.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="fitness-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">Nenhum treino adicionado</Text>
            </View>
          ) : (
            routineTrainings.map((rt) => (
              <View
                key={rt.id}
                className="bg-[#141c30] rounded-lg p-4 mb-2 flex-row items-center justify-between"
              >
                <TouchableOpacity
                  className="flex-1"
                  onPress={() => router.push(`/treino-details?id=${rt.training_id}` as any)}
                >
                  <Text className="text-white font-semibold">{rt.training_name}</Text>
                  {rt.day_of_week && (
                    <Text className="text-gray-400 text-sm mt-1">{rt.day_of_week}</Text>
                  )}
                  {rt.notes && (
                    <Text className="text-gray-400 text-sm mt-1">{rt.notes}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="ml-2 p-2"
                  onPress={() => handleRemoveTraining(rt.id!)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </LiquidGlassCard>

        {/* Botão Excluir */}
        <TouchableOpacity
          className="bg-red-500/20 border border-red-500 rounded-lg p-4 items-center mt-4"
          onPress={handleDeleteRoutine}
        >
          <Text className="text-red-500 font-bold text-lg">Excluir Rotina</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para Adicionar Treino */}
      {showAddTrainingModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View className="bg-[#141c30] p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">Adicionar Treino</Text>
                <TouchableOpacity onPress={() => setShowAddTrainingModal(false)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-400 mb-4">
                Selecione um treino existente ou crie um novo
              </Text>

              {/* Botão Criar Novo Treino */}
              <TouchableOpacity
                className="bg-[#60A5FA] rounded-lg p-4 items-center mb-4"
                onPress={() => {
                  setShowAddTrainingModal(false);
                  router.push(`/treino-form?routineType=${routine?.routine_type}&routineId=${routineId}` as any);
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text className="text-white font-semibold ml-2">Criar Novo Treino</Text>
                </View>
              </TouchableOpacity>

              <ScrollView className="max-h-96">
                {availableTrainings.length === 0 ? (
                  <View className="items-center py-8">
                    <Ionicons name="barbell-outline" size={48} color="#9CA3AF" />
                    <Text className="text-gray-400 mt-2">Nenhum treino disponível</Text>
                  </View>
                ) : (
                  availableTrainings.map((training) => {
                    const isAlreadyAdded = routineTrainings.some(
                      rt => rt.training_id === training.id
                    );

                    return (
                      <TouchableOpacity
                        key={training.id}
                        className={`p-4 mb-2 rounded-lg ${
                          isAlreadyAdded ? 'bg-gray-700 opacity-50' : 'bg-[#1e2a47]'
                        }`}
                        onPress={() => !isAlreadyAdded && handleAddTraining(training.id!)}
                        disabled={isAlreadyAdded}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-white font-semibold">{training.name}</Text>
                            {training.day_of_week && (
                              <Text className="text-gray-400 text-sm mt-1">
                                {training.day_of_week}
                              </Text>
                            )}
                          </View>
                          {isAlreadyAdded && (
                            <Ionicons name="checkmark-circle" size={24} color="#60A5FA" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <TouchableOpacity
                className="bg-gray-600 rounded-lg p-4 items-center mt-4"
                onPress={() => setShowAddTrainingModal(false)}
              >
                <Text className="text-white font-semibold">Fechar</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}

      {/* Modal para Criar Novo Treino */}
      {showCreateTrainingModal && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View className="bg-[#141c30] p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">Criar Novo Treino</Text>
                <TouchableOpacity onPress={() => setShowCreateTrainingModal(false)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-96">
                {/* Nome do Treino */}
                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2">Nome *</Text>
                  <TextInput
                    className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                    placeholder="Digite o nome do treino"
                    placeholderTextColor="#6B7280"
                    value={newTrainingName}
                    onChangeText={setNewTrainingName}
                  />
                </View>

                {/* Campo condicional baseado no tipo da rotina */}
                {routine?.routine_type === 'Dia da semana' && (
                  <View className="mb-4">
                    <Text className="text-gray-400 text-sm mb-2">Dia da Semana *</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => (
                        <TouchableOpacity
                          key={day}
                          className={`px-4 py-2 rounded-lg ${
                            newTrainingDayOfWeek === day ? 'bg-[#60A5FA]' : 'bg-[#1e2a47]'
                          }`}
                          onPress={() => setNewTrainingDayOfWeek(day)}
                        >
                          <Text className="text-white text-sm">{day}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {routine?.routine_type === 'Numérico' && (
                  <View className="mb-4">
                    <Text className="text-gray-400 text-sm mb-2">Número do Treino *</Text>
                    <TextInput
                      className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                      placeholder="Ex: 1, 2, 3..."
                      placeholderTextColor="#6B7280"
                      keyboardType="numeric"
                      value={newTrainingNumber}
                      onChangeText={setNewTrainingNumber}
                    />
                  </View>
                )}

                {/* Observações */}
                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2">Observações</Text>
                  <TextInput
                    className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                    placeholder="Adicione observações sobre o treino..."
                    placeholderTextColor="#6B7280"
                    value={newTrainingNotes}
                    onChangeText={setNewTrainingNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              {/* Botões */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-600 rounded-lg p-4 items-center"
                  onPress={() => setShowCreateTrainingModal(false)}
                >
                  <Text className="text-white font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-[#60A5FA] rounded-lg p-4 items-center"
                  onPress={handleCreateNewTraining}
                >
                  <Text className="text-white font-semibold">Criar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
}

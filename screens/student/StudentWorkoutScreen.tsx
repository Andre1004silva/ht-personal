import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Dimensions, Animated, Alert, Modal, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import { agendaPointService } from '../../services';
import trainingRoutinesService, { TrainingRoutine } from '../../services/trainingRoutinesService';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutDay {
  day: string;
  dayName: string;
  workoutName: string;
  duration: string;
  exercises: any[];
  completed: boolean;
  routineId?: number;
  trainingId?: number;
}

export default function StudentWorkoutScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [registrandoPonto, setRegistrandoPonto] = useState<string | null>(null);
  const [pontosRegistrados, setPontosRegistrados] = useState<Set<string>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [dialogForm, setDialogForm] = useState({
    workoutName: '',
    duration: '',
    dayWeek: '',
    notes: ''
  });
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const [trainingRoutines, setTrainingRoutines] = useState<TrainingRoutine[]>([]);
  const [weekWorkouts, setWeekWorkouts] = useState<WorkoutDay[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega rotinas de treino do aluno
  const loadWorkouts = async () => {
    if (!user?.id) return;

    try {
      setLoadingWorkouts(true);

      // Busca rotinas completas do estudante
      const routines = await trainingRoutinesService.getStudentCompleteRoutines(user.id);
      setTrainingRoutines(routines);

      // Organiza treinos por dia da semana
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      
      const workoutsByDay: WorkoutDay[] = [];

      // Se há rotinas ativas
      if (routines.length > 0) {
        const activeRoutine = routines.find(r => {
          const now = new Date();
          const startDate = new Date(r.start_date);
          const endDate = new Date(r.end_date);
          return now >= startDate && now <= endDate;
        }) || routines[0]; // Pega a primeira se não há ativa

        if (activeRoutine?.trainings) {
          // Organiza treinos por tipo de rotina
          if (activeRoutine.routine_type === 'Dia da semana') {
            // Mapeia treinos por dia da semana
            for (let i = 0; i < days.length; i++) {
              const training = activeRoutine.trainings.find(t => 
                t.day_of_week?.toLowerCase().includes(dayNames[i].toLowerCase().substring(0, 3))
              );

              if (training) {
                workoutsByDay.push({
                  day: days[i],
                  dayName: dayNames[i],
                  workoutName: training.name,
                  duration: `${training.exercises?.length * 3 || 45} min`,
                  exercises: training.exercises || [],
                  completed: false,
                  routineId: activeRoutine.id,
                  trainingId: training.id,
                });
              } else {
                // Dia de descanso
                workoutsByDay.push({
                  day: days[i],
                  dayName: dayNames[i],
                  workoutName: 'Descanso',
                  duration: '0 min',
                  exercises: [],
                  completed: false,
                });
              }
            }
          } else {
            // Rotina numérica - distribui treinos sequencialmente
            for (let i = 0; i < days.length; i++) {
              const training = activeRoutine.trainings[i % activeRoutine.trainings.length];
              
              if (training && i < activeRoutine.trainings.length * 2) {
                workoutsByDay.push({
                  day: days[i],
                  dayName: dayNames[i],
                  workoutName: training.name,
                  duration: `${training.exercises?.length * 3 || 45} min`,
                  exercises: training.exercises || [],
                  completed: false,
                  routineId: activeRoutine.id,
                  trainingId: training.id,
                });
              } else {
                // Dia de descanso
                workoutsByDay.push({
                  day: days[i],
                  dayName: dayNames[i],
                  workoutName: 'Descanso',
                  duration: '0 min',
                  exercises: [],
                  completed: false,
                });
              }
            }
          }
        }
      }

      // Se não há treinos, preenche com dias de descanso
      if (workoutsByDay.length === 0) {
        for (let i = 0; i < days.length; i++) {
          workoutsByDay.push({
            day: days[i],
            dayName: dayNames[i],
            workoutName: 'Sem treino programado',
            duration: '0 min',
            exercises: [],
            completed: false,
          });
        }
      }

      setWeekWorkouts(workoutsByDay);
    } catch (error) {
      console.error('Erro ao carregar rotinas:', error);
      // Dados de fallback caso falhe
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      
      setWeekWorkouts(days.map((day, i) => ({
        day,
        dayName: dayNames[i],
        workoutName: 'Erro ao carregar',
        duration: '0 min',
        exercises: [],
        completed: false,
      })));
    } finally {
      setLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadWorkouts();
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    await loadWorkouts();
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

  const navigateToWorkoutDay = (workout: WorkoutDay) => {
    if (isRestDay(workout) || !workout.trainingId) return;
    
    router.push({
      pathname: '/workout-day-detail',
      params: { 
        trainingId: workout.trainingId.toString(),
        dayName: workout.dayName
      }
    });
  };

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const isRestDay = (workout: WorkoutDay) => {
    return workout.workoutName.toLowerCase().includes('descanso');
  };

  const registrarPonto = async (workout: WorkoutDay) => {
    if (isRestDay(workout)) return;
    
    try {
      setRegistrandoPonto(workout.day);
      
      await agendaPointService.registrarPonto(user?.id || 1, {
        workoutName: workout.workoutName,
        duration: workout.duration,
        dayName: workout.dayName,
        notes: `Treino concluído com ${workout.exercises.length} exercícios`
      });
      
      // Adiciona o dia aos pontos registrados
      setPontosRegistrados(prev => new Set([...prev, workout.day]));
      
      Alert.alert(
        'Ponto Registrado! ✅',
        `Seu treino de ${workout.dayName} foi registrado com sucesso!`,
        [{ text: 'OK', style: 'default' }]
      );
      
    } catch (error: any) {
      console.error('Erro ao registrar ponto:', error);
      Alert.alert(
        'Erro ao Registrar',
        error.response?.data?.message || 'Não foi possível registrar o ponto. Tente novamente.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setRegistrandoPonto(null);
    }
  };

  const jaRegistrouPonto = (workout: WorkoutDay) => {
    return pontosRegistrados.has(workout.day);
  };

  const resetDialogForm = () => {
    setDialogForm({
      workoutName: '',
      duration: '',
      dayWeek: '',
      notes: ''
    });
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetDialogForm();
  };

  const handleSubmitDialog = async () => {
    if (!dialogForm.workoutName.trim() || !dialogForm.duration.trim() || !dialogForm.dayWeek.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha nome do treino, duração e dia da semana.');
      return;
    }

    try {
      setRegistrandoPonto('dialog');
      
      await agendaPointService.registrarPonto(user?.id || 1, {
        workoutName: dialogForm.workoutName,
        duration: dialogForm.duration,
        dayName: dialogForm.dayWeek,
        notes: dialogForm.notes || `Treino personalizado registrado`
      });
      
      Alert.alert(
        'Treino Registrado! ✅',
        `Seu treino "${dialogForm.workoutName}" foi registrado com sucesso!`,
        [{ text: 'OK', style: 'default' }]
      );
      
      handleCloseDialog();
      
    } catch (error: any) {
      console.error('Erro ao registrar treino personalizado:', error);
      Alert.alert(
        'Erro ao Registrar',
        error.response?.data?.message || 'Não foi possível registrar o treino. Tente novamente.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setRegistrandoPonto(null);
    }
  };

  const navigateToWorkoutDetail = () => {
    if (trainingRoutines.length > 0) {
      const activeRoutine = trainingRoutines.find(r => {
        const now = new Date();
        const startDate = new Date(r.start_date);
        const endDate = new Date(r.end_date);
        return now >= startDate && now <= endDate;
      }) || trainingRoutines[0];

      router.push({
        pathname: '/workout-detail',
        params: { routineId: activeRoutine.id?.toString() || '1' }
      });
    } else {
      Alert.alert('Aviso', 'Nenhuma rotina de treino encontrada');
    }
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
        intensity={30}
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
      <View style={{ paddingTop: 120, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
              Meus Treinos
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>
              Plano semanal de treinos
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* Botão Ver Rotina Completa */}
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(34, 197, 94, 0.3)',
                borderWidth: 2,
                borderColor: '#22C55E',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4,
              }}
              activeOpacity={0.7}
              onPress={navigateToWorkoutDetail}
            >
              <Ionicons name="list" size={24} color="#22C55E" />
            </TouchableOpacity>

            {/* Botão Adicionar Treino */}
            <TouchableOpacity
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 2,
                borderColor: '#60A5FA',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4,
              }}
              activeOpacity={0.7}
              onPress={() => setShowDialog(true)}
            >
              <Ionicons name="add" size={24} color="#60A5FA" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Treinos da Semana */}
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
        {weekWorkouts.map((workout, index) => (
          <View key={workout.day} style={{ marginBottom: 16 }}>
            <LiquidGlassCard>
              <TouchableOpacity
                onPress={() => navigateToWorkoutDay(workout)}
                activeOpacity={isRestDay(workout) ? 1 : 0.7}
              >
                {/* Header do Card */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {/* Indicador do Dia */}
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: workout.completed 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : isRestDay(workout)
                        ? 'rgba(156, 163, 175, 0.2)'
                        : 'rgba(59, 130, 246, 0.3)',
                      borderWidth: 2,
                      borderColor: workout.completed 
                        ? '#22C55E' 
                        : isRestDay(workout)
                        ? 'rgba(156, 163, 175, 0.3)'
                        : '#60A5FA',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      {workout.completed ? (
                        <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
                      ) : isRestDay(workout) ? (
                        <Ionicons name="moon" size={24} color="#9CA3AF" />
                      ) : (
                        <Text style={{ color: '#60A5FA', fontSize: 18, fontWeight: 'bold' }}>
                          {workout.day}
                        </Text>
                      )}
                    </View>

                    {/* Info do Treino */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 2 }}>
                        {workout.dayName}
                      </Text>
                      <Text style={{ 
                        color: 'white', 
                        fontSize: 16, 
                        fontWeight: '600', 
                        marginBottom: 4 
                      }}>
                        {workout.workoutName}
                      </Text>
                      {!isRestDay(workout) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="time" size={14} color="#9CA3AF" />
                          <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 4, marginRight: 12 }}>
                            {workout.duration}
                          </Text>
                          <Ionicons name="fitness" size={14} color="#9CA3AF" />
                          <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 4 }}>
                            {workout.exercises.length} exercícios
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Ícone de Navegação */}
                  {!isRestDay(workout) && (
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color="#60A5FA" 
                    />
                  )}
                </View>
              </TouchableOpacity>
            </LiquidGlassCard>
          </View>
        ))}
      </ScrollView>

      {/* Dialog de Registro de Treino */}
      <Modal
          visible={showDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseDialog}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}>
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                width: '100%',
                maxWidth: 400,
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <View style={{
                backgroundColor: 'rgba(20, 28, 48, 0.95)',
                padding: 24,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(96, 165, 250, 0.3)',
              }}>
                {/* Header do Dialog */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                    Registrar Treino
                  </Text>
                  <TouchableOpacity onPress={handleCloseDialog}>
                    <Ionicons name="close" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Formulário */}
                <View style={{ gap: 16 }}>
                  {/* Nome do Treino */}
                  <View>
                    <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
                      Nome do Treino *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(96, 165, 250, 0.3)',
                        borderRadius: 12,
                        padding: 12,
                        color: 'white',
                        fontSize: 16,
                      }}
                      placeholder="Ex: Treino A - Peito e Tríceps"
                      placeholderTextColor="#6B7280"
                      value={dialogForm.workoutName}
                      onChangeText={(text) => setDialogForm(prev => ({ ...prev, workoutName: text }))}
                    />
                  </View>

                  {/* Duração */}
                  <View>
                    <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
                      Duração *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(96, 165, 250, 0.3)',
                        borderRadius: 12,
                        padding: 12,
                        color: 'white',
                        fontSize: 16,
                      }}
                      placeholder="Ex: 45 min"
                      placeholderTextColor="#6B7280"
                      value={dialogForm.duration}
                      onChangeText={(text) => setDialogForm(prev => ({ ...prev, duration: text }))}
                    />
                  </View>

                  {/* Dia da Semana */}
                  <View>
                    <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
                      Dia da Semana *
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(96, 165, 250, 0.3)',
                        borderRadius: 12,
                        padding: 12,
                        color: 'white',
                        fontSize: 16,
                      }}
                      placeholder="Ex: Segunda-feira"
                      placeholderTextColor="#6B7280"
                      value={dialogForm.dayWeek}
                      onChangeText={(text) => setDialogForm(prev => ({ ...prev, dayWeek: text }))}
                    />
                  </View>

                  {/* Observações */}
                  <View>
                    <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
                      Observações
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(96, 165, 250, 0.3)',
                        borderRadius: 12,
                        padding: 12,
                        color: 'white',
                        fontSize: 16,
                        minHeight: 80,
                        textAlignVertical: 'top',
                      }}
                      placeholder="Observações sobre o treino (opcional)"
                      placeholderTextColor="#6B7280"
                      value={dialogForm.notes}
                      onChangeText={(text) => setDialogForm(prev => ({ ...prev, notes: text }))}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                {/* Botões */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(156, 163, 175, 0.2)',
                      borderRadius: 12,
                      padding: 14,
                      alignItems: 'center',
                    }}
                    onPress={handleCloseDialog}
                  >
                    <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: '600' }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      borderRadius: 12,
                      padding: 14,
                      alignItems: 'center',
                      opacity: registrandoPonto === 'dialog' ? 0.6 : 1,
                    }}
                    onPress={handleSubmitDialog}
                    disabled={registrandoPonto === 'dialog'}
                  >
                    {registrandoPonto === 'dialog' ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="hourglass" size={16} color="white" />
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                          Registrando...
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                        Registrar
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>

        <RefreshSplash 
          visible={showRefreshSplash} 
          scale={splashScale} 
          opacity={splashOpacity} 
        />
      </View>
    );
  }
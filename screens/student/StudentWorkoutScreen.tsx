import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Dimensions, Animated, Alert, Modal, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import { agendaPointService, clientTrainingService, trainingsService, exercisesService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const { width: screenWidth } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest: string;
  completed?: boolean;
}

interface WorkoutDay {
  day: string;
  dayName: string;
  workoutName: string;
  duration: string;
  exercises: Exercise[];
  completed: boolean;
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
  const [clientTrainings, setClientTrainings] = useState<any[]>([]);
  const [weekWorkouts, setWeekWorkouts] = useState<WorkoutDay[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega treinos do aluno
  const loadWorkouts = async () => {
    if (!user?.id) return;

    try {
      setLoadingWorkouts(true);

      // Busca treinos atribuídos
      const trainings = await clientTrainingService.getByClientId(user.id);
      setClientTrainings(trainings);

      // Organiza treinos por dia da semana
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      
      const workoutsByDay: WorkoutDay[] = [];

      for (let i = 0; i < days.length; i++) {
        const training = trainings[i % trainings.length]; // Distribui treinos pelos dias
        
        if (training && i < trainings.length * 2) { // Limita repetições
          try {
            const trainingDetails = await trainingsService.getById(training.training_id);
            
            workoutsByDay.push({
              day: days[i],
              dayName: dayNames[i],
              workoutName: training.training_name || trainingDetails.name || 'Treino',
              duration: '45 min',
              exercises: [],
              completed: false,
            });
          } catch (error) {
            console.log('Erro ao carregar detalhes do treino:', error);
          }
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

      setWeekWorkouts(workoutsByDay);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      // Dados de fallback caso falhe
      setWeekWorkouts([]);
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
                onPress={() => !isRestDay(workout) && toggleDay(workout.day)}
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

                  {/* Ícone de Expandir */}
                  {!isRestDay(workout) && (
                    <Ionicons 
                      name={expandedDay === workout.day ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color="#60A5FA" 
                    />
                  )}
                </View>

                {/* Lista de Exercícios (Expandida) */}
                {expandedDay === workout.day && !isRestDay(workout) && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(156, 163, 175, 0.2)' }}>
                    {workout.exercises.map((exercise, idx) => (
                      <View
                        key={exercise.id}
                        style={{
                          backgroundColor: exercise.completed 
                            ? 'rgba(34, 197, 94, 0.1)' 
                            : 'rgba(59, 130, 246, 0.1)',
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: idx < workout.exercises.length - 1 ? 12 : 0,
                          borderLeftWidth: 3,
                          borderLeftColor: exercise.completed ? '#22C55E' : '#60A5FA',
                        }}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ 
                              color: 'white', 
                              fontSize: 15, 
                              fontWeight: '600',
                              textDecorationLine: exercise.completed ? 'line-through' : 'none',
                            }}>
                              {exercise.name}
                            </Text>
                          </View>
                          {exercise.completed && (
                            <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                          )}
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="repeat" size={14} color="#9CA3AF" />
                            <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                              {exercise.sets}x {exercise.reps}
                            </Text>
                          </View>

                          {exercise.weight && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="barbell" size={14} color="#9CA3AF" />
                              <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                                {exercise.weight}
                              </Text>
                            </View>
                          )}

                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="timer" size={14} color="#9CA3AF" />
                            <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                              {exercise.rest}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}

                    {/* Botão Registrar Ponto */}
                    {!workout.completed && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: jaRegistrouPonto(workout) 
                            ? 'rgba(34, 197, 94, 0.3)' 
                            : 'rgba(59, 130, 246, 0.3)',
                          borderRadius: 12,
                          padding: 14,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 12,
                          opacity: registrandoPonto === workout.day ? 0.6 : 1,
                        }}
                        activeOpacity={0.7}
                        onPress={() => registrarPonto(workout)}
                        disabled={registrandoPonto === workout.day || jaRegistrouPonto(workout)}
                      >
                        {registrandoPonto === workout.day ? (
                          <>
                            <Ionicons name="hourglass" size={24} color="white" />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                              Registrando...
                            </Text>
                          </>
                        ) : jaRegistrouPonto(workout) ? (
                          <>
                            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                            <Text style={{ color: '#22C55E', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                              Ponto Registrado
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="fitness" size={24} color="white" />
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                              Registrar Ponto
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
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
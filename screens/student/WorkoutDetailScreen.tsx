import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import trainingRoutinesService, { TrainingRoutine, Training, Exercise } from '../../services/trainingRoutinesService';
import { useAuth } from '../../contexts/AuthContext';

export default function WorkoutDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [routine, setRoutine] = useState<TrainingRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTraining, setExpandedTraining] = useState<number | null>(null);
  
  // Estados para controle do treino ativo
  const [activeTraining, setActiveTraining] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showTrainingSelector, setShowTrainingSelector] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    loadRoutineDetails();
  }, []);

  // Cleanup do timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadRoutineDetails = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const routines = await trainingRoutinesService.getStudentCompleteRoutines(user.id);
      
      // Encontra a rotina específica (pode ser melhorado com ID específico)
      const targetRoutine = routines.find(r => r.id === Number(params.routineId)) || routines[0];
      setRoutine(targetRoutine || null);
    } catch (error) {
      console.error('Erro ao carregar detalhes da rotina:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da rotina');
    } finally {
      setLoading(false);
    }
  };

  const toggleTraining = (trainingId: number) => {
    setExpandedTraining(expandedTraining === trainingId ? null : trainingId);
  };

  const formatDuration = (exercises: Exercise[]) => {
    return `${exercises.length * 3} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Adaptação': return '#10B981';
      case 'Iniciante': return '#3B82F6';
      case 'Intermediário': return '#F59E0B';
      case 'Avançado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Funções para controle do treino
  const startWorkout = (trainingId: number) => {
    console.log('Iniciando treino:', trainingId);
    Alert.alert('Treino Iniciado!', `Iniciando treino ID: ${trainingId}`);
    
    setActiveTraining(trainingId);
    setIsWorkoutActive(true);
    setWorkoutTime(0);
    setCompletedExercises(new Set());
    
    // Iniciar cronômetro
    timerRef.current = setInterval(() => {
      setWorkoutTime(prev => prev + 1);
    }, 1000) as unknown as number;
  };

  const finishWorkout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveTraining(null);
    setIsWorkoutActive(false);
    setWorkoutTime(0);
    setCompletedExercises(new Set());
    
    Alert.alert('Treino Concluído!', 'Parabéns! Você finalizou o treino.');
  };

  const toggleExerciseCompletion = (exerciseId: number) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutProgress = (training: Training) => {
    if (!isWorkoutActive || activeTraining !== training.id) return 0;
    return (completedExercises.size / training.exercises.length) * 100;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <Ionicons name="hourglass" size={48} color="#60A5FA" />
        <Text className="text-white text-lg mt-4">Carregando rotina...</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-white text-lg mt-4">Rotina não encontrada</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
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

      {/* Cronômetro do Treino Ativo */}
      {isWorkoutActive && (
        <View style={{ 
          position: 'absolute',
          top: 60,
          left: 24,
          right: 24,
          zIndex: 10,
        }}>
          <LiquidGlassCard>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: 4,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(34, 197, 94, 0.3)',
                  borderWidth: 2,
                  borderColor: '#22C55E',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="timer" size={24} color="#22C55E" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                    {formatTime(workoutTime)}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                    Treino em andamento
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={finishWorkout}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#EF4444',
                }}
              >
                <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
                  Finalizar
                </Text>
              </TouchableOpacity>
            </View>
          </LiquidGlassCard>
        </View>
      )}

      {/* Header */}
      <View style={{ paddingTop: isWorkoutActive ? 140 : 60, paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#60A5FA" />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              Detalhes da Rotina
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>
              {routine.goal} • {routine.difficulty}
            </Text>
          </View>
        </View>

        {/* Info da Rotina */}
        <LiquidGlassCard>
          <View style={{ padding: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                  Rotina de {routine.routine_type}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {new Date(routine.start_date).toLocaleDateString()} - {new Date(routine.end_date).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={{
                backgroundColor: `${getDifficultyColor(routine.difficulty)}20`,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: getDifficultyColor(routine.difficulty),
              }}>
                <Text style={{ color: getDifficultyColor(routine.difficulty), fontSize: 12, fontWeight: '600' }}>
                  {routine.difficulty}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="flag" size={16} color="#60A5FA" />
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 8 }}>
                Objetivo: {routine.goal}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="fitness" size={16} color="#60A5FA" />
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 8 }}>
                {routine.trainings?.length || 0} treinos programados
              </Text>
            </View>

            {routine.instructions && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14, fontStyle: 'italic' }}>
                  {routine.instructions}
                </Text>
              </View>
            )}
          </View>
        </LiquidGlassCard>
      </View>

      {/* Lista de Treinos */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {routine.trainings?.map((training, index) => (
          <View key={training.id} style={{ marginBottom: 16 }}>
            <LiquidGlassCard>
                {/* Header do Treino */}
                <View style={{ flexDirection: 'column' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {/* Número do Treino */}
                      <View style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        borderWidth: 2,
                        borderColor: '#60A5FA',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}>
                        <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: 'bold' }}>
                          {index + 1}
                        </Text>
                      </View>

                      {/* Info do Treino */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                          {training.name}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                          {training.day_of_week && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                              <Ionicons name="calendar" size={14} color="#9CA3AF" />
                              <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                                {training.day_of_week}
                              </Text>
                            </View>
                          )}
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                            <Ionicons name="time" size={14} color="#9CA3AF" />
                            <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                              {formatDuration(training.exercises)}
                            </Text>
                          </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="barbell" size={14} color="#9CA3AF" />
                            <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                              {training.exercises.length} exercícios
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => toggleTraining(training.id)}
                        style={{ padding: 8 }}
                      >
                        <Ionicons 
                          name={expandedTraining === training.id ? "chevron-up" : "chevron-down"} 
                          size={24} 
                          color="#60A5FA" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Mensagem e Botão INICIAR - Estilo da segunda imagem */}
                  {!isWorkoutActive ? (
                    <View style={{ marginTop: 12 }}>
                      <View style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                      }}>
                        <Text style={{ 
                          color: 'white', 
                          fontSize: 14, 
                          textAlign: 'center',
                          marginBottom: 4,
                        }}>
                          Você está no "modo visualização".
                        </Text>
                        <Text style={{ 
                          color: '#9CA3AF', 
                          fontSize: 13, 
                          textAlign: 'center',
                        }}>
                          Aperte INICIAR para começar seu treino.
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => {
                          startWorkout(training.id);
                          setExpandedTraining(training.id);
                        }}
                        style={{
                          backgroundColor: '#22C55E',
                          paddingVertical: 18,
                          borderRadius: 12,
                          alignItems: 'center',
                          shadowColor: '#22C55E',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 8,
                        }}
                      >
                        <Text style={{ 
                          color: 'white', 
                          fontSize: 18, 
                          fontWeight: 'bold',
                          letterSpacing: 1,
                        }}>
                          INICIAR
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : activeTraining === training.id ? (
                    <View style={{
                      backgroundColor: '#22C55E',
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      marginTop: 8,
                      opacity: 0.8,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={{ 
                          color: 'white', 
                          fontSize: 18, 
                          fontWeight: 'bold',
                          letterSpacing: 1,
                        }}>
                          TREINO ATIVO
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{
                      backgroundColor: 'rgba(156, 163, 175, 0.5)',
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      marginTop: 8,
                    }}>
                      <Text style={{ 
                        color: '#9CA3AF', 
                        fontSize: 18, 
                        fontWeight: 'bold',
                        letterSpacing: 1,
                      }}>
                        AGUARDANDO
                      </Text>
                    </View>
                  )}
                </View>

                {/* Barra de Progresso do Treino Ativo */}
                {isWorkoutActive && activeTraining === training.id && (
                  <View style={{ marginTop: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                        Progresso do treino
                      </Text>
                      <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: '600' }}>
                        {completedExercises.size}/{training.exercises.length} exercícios
                      </Text>
                    </View>
                    <View style={{
                      height: 6,
                      backgroundColor: 'rgba(156, 163, 175, 0.3)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <View style={{
                        height: '100%',
                        width: `${getWorkoutProgress(training)}%`,
                        backgroundColor: '#22C55E',
                        borderRadius: 3,
                      }} />
                    </View>
                  </View>
                )}

                {/* Lista de Exercícios (Expandida) */}
                {expandedTraining === training.id && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(156, 163, 175, 0.2)' }}>
                    {training.exercises.map((exercise, idx) => {
                      const isCompleted = completedExercises.has(exercise.id);
                      const isTrainingActive = isWorkoutActive && activeTraining === training.id;
                      
                      return (
                        <TouchableOpacity
                          key={exercise.id}
                          onPress={() => isTrainingActive && toggleExerciseCompletion(exercise.id)}
                          disabled={!isTrainingActive}
                          style={{
                            backgroundColor: isCompleted 
                              ? 'rgba(34, 197, 94, 0.2)' 
                              : 'rgba(59, 130, 246, 0.1)',
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: idx < training.exercises.length - 1 ? 12 : 0,
                            borderLeftWidth: 3,
                            borderLeftColor: isCompleted ? '#22C55E' : '#60A5FA',
                            opacity: isCompleted ? 0.8 : 1,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Text style={{ 
                              color: 'white', 
                              fontSize: 15, 
                              fontWeight: '600',
                              marginBottom: 8,
                              flex: 1,
                              textDecorationLine: isCompleted ? 'line-through' : 'none',
                            }}>
                              {exercise.name}
                            </Text>
                            
                            {isTrainingActive && (
                              <TouchableOpacity
                                onPress={() => toggleExerciseCompletion(exercise.id)}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  borderWidth: 2,
                                  borderColor: isCompleted ? '#22C55E' : '#9CA3AF',
                                  backgroundColor: isCompleted ? '#22C55E' : 'transparent',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginLeft: 12,
                                }}
                              >
                                {isCompleted && (
                                  <Ionicons name="checkmark" size={16} color="white" />
                                )}
                              </TouchableOpacity>
                            )}
                          </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                          {exercise.sets && exercise.reps && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="repeat" size={14} color="#9CA3AF" />
                              <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                                {exercise.sets}x {exercise.reps}
                              </Text>
                            </View>
                          )}

                          {exercise.muscle_group && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="body" size={14} color="#9CA3AF" />
                              <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                                {exercise.muscle_group}
                              </Text>
                            </View>
                          )}

                          {exercise.equipment && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="barbell" size={14} color="#9CA3AF" />
                              <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                                {exercise.equipment}
                              </Text>
                            </View>
                          )}

                          {exercise.rest_time && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="timer" size={14} color="#9CA3AF" />
                              <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                                {exercise.rest_time}s
                              </Text>
                            </View>
                          )}
                        </View>

                          {exercise.exercise_notes && (
                            <Text style={{ 
                              color: '#9CA3AF', 
                              fontSize: 12, 
                              marginTop: 8,
                              fontStyle: 'italic'
                            }}>
                              {exercise.exercise_notes}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}

                    {training.routine_notes && (
                      <View style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: '#22C55E',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Ionicons name="document-text" size={16} color="#22C55E" />
                          <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                            Observações do Treino
                          </Text>
                        </View>
                        <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                          {training.routine_notes}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
            </LiquidGlassCard>
          </View>
        ))}

        {(!routine.trainings || routine.trainings.length === 0) && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="fitness" size={64} color="#6B7280" />
            <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 16 }}>
              Nenhum treino programado nesta rotina
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botão Fixo Iniciar Treino */}
      {!isWorkoutActive && routine.trainings && routine.trainings.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: 40,
        }}>
          {/* Blur de fundo */}
          <BlurView
            intensity={20}
            tint="dark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
          
          {/* Conteúdo do botão */}
          <View style={{
            backgroundColor: 'rgba(11, 17, 32, 0.8)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 16,
          }}>
            <TouchableOpacity
              onPress={() => {
                if (routine.trainings!.length === 1) {
                  // Se há apenas um treino, iniciar diretamente
                  const firstTraining = routine.trainings![0];
                  startWorkout(firstTraining.id);
                  setExpandedTraining(firstTraining.id);
                } else {
                  // Se há múltiplos treinos, mostrar seletor
                  setShowTrainingSelector(true);
                }
              }}
              style={{
                backgroundColor: '#22C55E',
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#22C55E',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="play" size={24} color="white" style={{ marginRight: 12 }} />
                <Text style={{ 
                  color: 'white', 
                  fontSize: 20, 
                  fontWeight: 'bold',
                  letterSpacing: 1,
                }}>
                  INICIAR TREINO
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Indicador de treino */}
            <Text style={{
              color: '#9CA3AF',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 8,
            }}>
              {routine.trainings.length} treino{routine.trainings.length > 1 ? 's' : ''} disponível{routine.trainings.length > 1 ? 'eis' : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Modal de Seleção de Treino */}
      <Modal
        visible={showTrainingSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTrainingSelector(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'flex-end',
        }}>
          <BlurView
            intensity={20}
            tint="dark"
            style={{
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View style={{
              backgroundColor: 'rgba(11, 17, 32, 0.9)',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 20,
              paddingHorizontal: 24,
              paddingBottom: 40,
              maxHeight: '70%',
            }}>
              {/* Header do Modal */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 20, 
                  fontWeight: 'bold' 
                }}>
                  Selecionar Treino
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTrainingSelector(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(156, 163, 175, 0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Lista de Treinos */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {routine?.trainings?.map((training, index) => (
                  <TouchableOpacity
                    key={training.id}
                    onPress={() => {
                      startWorkout(training.id);
                      setExpandedTraining(training.id);
                      setShowTrainingSelector(false);
                    }}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: '#60A5FA',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        borderWidth: 2,
                        borderColor: '#60A5FA',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 16,
                      }}>
                        <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: 'bold' }}>
                          {index + 1}
                        </Text>
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: 'white', 
                          fontSize: 16, 
                          fontWeight: '600',
                          marginBottom: 4,
                        }}>
                          {training.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="barbell" size={14} color="#9CA3AF" />
                          <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 4 }}>
                            {training.exercises.length} exercícios
                          </Text>
                          {training.day_of_week && (
                            <>
                              <Text style={{ color: '#9CA3AF', marginHorizontal: 8 }}>•</Text>
                              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                                {training.day_of_week}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                      
                      <Ionicons name="play" size={20} color="#22C55E" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

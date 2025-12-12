import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import trainingRoutinesService, { Training, Exercise } from '../../services/trainingRoutinesService';
import { useAuth } from '../../contexts/AuthContext';
import feedbackService from '../../services/feedbackService';
import repetitionsService from '../../services/repetitionsService';

export default function WorkoutDayDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayName, setDayName] = useState('');
  
  // Estados para controle do treino ativo
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [workoutTime, setWorkoutTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Estados para o modal de feedback
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  
  // Estados para repetições dos exercícios
  const [exerciseRepetitions, setExerciseRepetitions] = useState<Record<number, any>>({});

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    loadTrainingDetails();
  }, []);

  // Cleanup do timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadTrainingDetails = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const routines = await trainingRoutinesService.getStudentCompleteRoutines(user.id);
      
      // Encontra o treino específico
      let targetTraining: Training | null = null;
      
      for (const routine of routines) {
        if (routine.trainings) {
          targetTraining = routine.trainings.find(t => 
            t.id === Number(params.trainingId)
          ) || null;
          if (targetTraining) break;
        }
      }

      setTraining(targetTraining);
      setDayName(params.dayName as string || '');
    } catch (error) {
      console.error('Erro ao carregar detalhes do treino:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do treino');
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseRepetitions = async (exerciseId: number) => {
    try {
      // Usar admin_id do usuário logado, ou 1 como fallback
      const adminId = user?.admin_id || 1;
      console.log('Carregando repetições para exercício:', exerciseId, 'com admin_id:', adminId);
      
      const repetitions = await repetitionsService.getByExercise(exerciseId, adminId);
      setExerciseRepetitions(prev => ({
        ...prev,
        [exerciseId]: repetitions
      }));
      
      console.log('Repetições carregadas:', repetitions);
    } catch (error: any) {
      console.error('Erro ao carregar repetições do exercício:', error);
      
      // Mostrar erro mais específico para debug
      if (error.response?.data) {
        console.error('Detalhes do erro:', error.response.data);
        Alert.alert(
          'Erro ao carregar repetições', 
          error.response.data.message || 'Erro desconhecido'
        );
      }
    }
  };

  const formatDuration = (exercises: Exercise[]) => {
    return `${exercises.length * 3} min`;
  };

  // Funções para controle do treino
  const startWorkout = () => {
    console.log('Iniciando treino:', training?.id);
    Alert.alert('Treino Iniciado!', `Iniciando treino: ${training?.name}`);
    
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
    setIsWorkoutActive(false);
    
    // Abrir modal de feedback
    setShowFeedbackModal(true);
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

  const getWorkoutProgress = () => {
    if (!training || !isWorkoutActive) return 0;
    return (completedExercises.size / training.exercises.length) * 100;
  };

  // Funções para seleção de imagens
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5, // Máximo 5 fotos
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(prev => [...prev, ...result.assets].slice(0, 5)); // Máximo 5 fotos total
      }
    } catch (error) {
      console.error('Erro ao selecionar imagens:', error);
      Alert.alert('Erro', 'Não foi possível selecionar as imagens.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para usar a câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages(prev => [...prev, ...result.assets].slice(0, 5)); // Máximo 5 fotos total
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const showImageOptions = () => {
    Alert.alert(
      'Adicionar Foto',
      'Como você gostaria de adicionar uma foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Galeria', onPress: pickImages },
      ]
    );
  };

  // Funções para o feedback
  const sendFeedback = async () => {
    if (!feedbackNote.trim()) {
      Alert.alert('Atenção', 'Por favor, escreva um comentário sobre o treino.');
      return;
    }

    if (!user?.id || !training) {
      Alert.alert('Erro', 'Informações do usuário não encontradas.');
      return;
    }

    try {
      setSendingFeedback(true);

      // Dados necessários para o feedback (você pode ajustar conforme sua estrutura)
      const feedbackData = {
        admin_id: 1, // Você precisa definir como obter o admin_id
        trainer_id: 1, // Você precisa definir como obter o trainer_id
        student_id: user.id,
        note: feedbackNote.trim(),
      };

      const createdFeedback = await feedbackService.createFeedback(feedbackData);

      // Enviar fotos se houver
      if (selectedImages.length > 0) {
        const formData = new FormData();
        
        selectedImages.forEach((image, index) => {
          formData.append('photos', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `photo_${index}.jpg`,
          } as any);
        });

        try {
          await feedbackService.uploadFeedbackPhotos(createdFeedback.id, formData);
        } catch (photoError) {
          console.error('Erro ao enviar fotos:', photoError);
          // Não falha o feedback se as fotos falharem
        }
      }

      // Resetar estados
      setFeedbackNote('');
      setSelectedImages([]);
      setShowFeedbackModal(false);

      // Navegar para tela de conclusão com dados do treino
      const now = new Date();
      const startTime = new Date(now.getTime() - workoutTime * 1000);
      
      router.replace({
        pathname: '/workout-completion',
        params: {
          workoutTime: workoutTime.toString(),
          completedExercises: completedExercises.size.toString(),
          totalExercises: training?.exercises.length.toString() || '0',
          trainingName: training?.name || 'Treino',
          startTime: startTime.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          endTime: now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        },
      });
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      Alert.alert('Erro', 'Não foi possível enviar o feedback. Tente novamente.');
    } finally {
      setSendingFeedback(false);
    }
  };

  const skipFeedback = () => {
    setFeedbackNote('');
    setSelectedImages([]);
    setShowFeedbackModal(false);

    // Navegar para tela de conclusão com dados do treino
    const now = new Date();
    const startTime = new Date(now.getTime() - workoutTime * 1000);
    
    router.replace({
      pathname: '/workout-completion',
      params: {
        workoutTime: workoutTime.toString(),
        completedExercises: completedExercises.size.toString(),
        totalExercises: training?.exercises.length.toString() || '0',
        trainingName: training?.name || 'Treino',
        startTime: startTime.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        endTime: now.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <Ionicons name="hourglass" size={48} color="#60A5FA" />
        <Text className="text-white text-lg mt-4">Carregando treino...</Text>
      </View>
    );
  }

  if (!training) {
    return (
      <View className="flex-1 bg-[#0B1120] items-center justify-center">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-white text-lg mt-4">Treino não encontrado</Text>
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

      {/* Cronômetro do Treino Ativo - Minimalista */}
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
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name="timer" size={20} color="#22C55E" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {formatTime(workoutTime)}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                    {completedExercises.size}/{training?.exercises.length || 0} concluídos
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={finishWorkout}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Ionicons name="stop" size={20} color="#EF4444" />
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
              {training.name}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>
              {dayName}
            </Text>
          </View>
        </View>

        {/* Info do Treino */}
        <LiquidGlassCard>
          <View style={{ padding: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                  Treino Completo
                </Text>
                {training.day_of_week && (
                  <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
                    {training.day_of_week}
                  </Text>
                )}
              </View>
              
              <View style={{
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#60A5FA',
              }}>
                <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '600' }}>
                  {training.exercises.length} exercícios
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="time" size={16} color="#60A5FA" />
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 8 }}>
                Duração estimada: {formatDuration(training.exercises)}
              </Text>
            </View>

            {training.notes && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="document-text" size={16} color="#60A5FA" />
                  <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                    Observações
                  </Text>
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {training.notes}
                </Text>
              </View>
            )}

            {training.routine_notes && (
              <View style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="clipboard" size={16} color="#22C55E" />
                  <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                    Instruções Especiais
                  </Text>
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {training.routine_notes}
                </Text>
              </View>
            )}
          </View>
        </LiquidGlassCard>
      </View>

      {/* Lista de Exercícios */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
          Exercícios ({training.exercises.length})
        </Text>

        {training.exercises.map((exercise, index) => {
          const isCompleted = completedExercises.has(exercise.id);
          
          return (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => isWorkoutActive && toggleExerciseCompletion(exercise.id)}
              disabled={!isWorkoutActive}
              style={{ marginBottom: 16 }}
            >
              <LiquidGlassCard>
                <View style={{ 
                  padding: 4,
                  opacity: isCompleted ? 0.7 : 1,
                }}>
                  {/* Header do Exercício */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    {/* Número do Exercício */}
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isCompleted 
                        ? 'rgba(34, 197, 94, 0.3)' 
                        : 'rgba(59, 130, 246, 0.3)',
                      borderWidth: 1,
                      borderColor: isCompleted ? '#22C55E' : '#60A5FA',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={16} color="#22C55E" />
                      ) : (
                        <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: 'bold' }}>
                          {index + 1}
                        </Text>
                      )}
                    </View>

                    {/* Nome do Exercício */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        color: 'white', 
                        fontSize: 16, 
                        fontWeight: '600',
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                      }}>
                        {exercise.name}
                      </Text>
                    </View>

                    {/* Checkbox minimalista quando treino ativo */}
                    {isWorkoutActive && (
                      <TouchableOpacity
                        onPress={() => toggleExerciseCompletion(exercise.id)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: isCompleted ? '#22C55E' : '#9CA3AF',
                          backgroundColor: isCompleted ? '#22C55E' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 8,
                        }}
                      >
                        {isCompleted && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                {/* Detalhes do Exercício */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  {exercise.muscle_group && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="body" size={16} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 6 }}>
                        {exercise.muscle_group}
                      </Text>
                    </View>
                  )}

                  {exercise.equipment && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="barbell" size={16} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 6 }}>
                        {exercise.equipment}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => loadExerciseRepetitions(exercise.id)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Ionicons name="list" size={16} color="#22C55E" />
                    <Text style={{ color: '#22C55E', fontSize: 14, marginLeft: 6, fontWeight: '600' }}>
                      Ver Repetições
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Repetições do Exercício */}
                {exerciseRepetitions[exercise.id] && (
                  <View style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="fitness" size={16} color="#22C55E" />
                      <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                        Repetições Programadas
                      </Text>
                    </View>
                    
                    {exerciseRepetitions[exercise.id].repetitions.length > 0 ? (
                      <View style={{ gap: 6 }}>
                        {exerciseRepetitions[exercise.id].repetitions.slice(0, 3).map((rep: any, repIndex: number) => (
                          <View key={rep.id} style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: 6,
                            padding: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: '#22C55E',
                          }}>
                            <Text style={{ color: '#22C55E', fontSize: 13, fontWeight: '600' }}>
                              {rep.formatted}
                            </Text>
                            <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>
                              Tipo: {rep.type} • {new Date(rep.created_at).toLocaleDateString('pt-BR')}
                            </Text>
                          </View>
                        ))}
                        
                        {exerciseRepetitions[exercise.id].repetitions.length > 3 && (
                          <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                            +{exerciseRepetitions[exercise.id].repetitions.length - 3} repetições...
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>
                        Nenhuma repetição programada para este exercício
                      </Text>
                    )}
                  </View>
                )}

                {exercise.exercise_notes && (
                  <View style={{ 
                    padding: 12, 
                    backgroundColor: 'rgba(156, 163, 175, 0.1)', 
                    borderRadius: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: '#9CA3AF',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="information-circle" size={16} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                        Observações
                      </Text>
                    </View>
                    <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                      {exercise.exercise_notes}
                    </Text>
                  </View>
                )}
                </View>
              </LiquidGlassCard>
            </TouchableOpacity>
          );
        })}

        {training.exercises.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="barbell" size={64} color="#6B7280" />
            <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 16 }}>
              Nenhum exercício programado para este treino
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botão Fixo Iniciar Treino - Minimalista */}
      {!isWorkoutActive && training && training.exercises.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 30,
          left: 24,
          right: 24,
        }}>
          <LiquidGlassCard>
            <TouchableOpacity
              onPress={startWorkout}
              style={{
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="play" size={20} color="#22C55E" style={{ marginRight: 8 }} />
                <Text style={{ 
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: '600',
                }}>
                  Iniciar Treino
                </Text>
              </View>
            </TouchableOpacity>
          </LiquidGlassCard>
        </View>
      )}

      {/* Modal de Feedback */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !sendingFeedback && skipFeedback()}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
          <LiquidGlassCard>
            <View style={{ padding: 8 }}>
              {/* Header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <Ionicons name="star" size={24} color="#22C55E" style={{ marginRight: 12 }} />
                <Text style={{ 
                  color: 'white', 
                  fontSize: 20, 
                  fontWeight: 'bold',
                  flex: 1,
                }}>
                  Como foi o treino?
                </Text>
              </View>

              {/* Resumo do treino */}
              <View style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
              }}>
                <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                  Treino Concluído
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 2 }}>
                  Tempo: {formatTime(workoutTime)}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                  Exercícios: {completedExercises.size}/{training?.exercises.length || 0} concluídos
                </Text>
              </View>

              {/* Campo de texto para feedback */}
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                Deixe seu comentário:
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(156, 163, 175, 0.1)',
                  borderRadius: 8,
                  padding: 12,
                  color: 'white',
                  fontSize: 14,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  marginBottom: 20,
                }}
                placeholder="Como você se sentiu durante o treino? Alguma dificuldade ou observação?"
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
                value={feedbackNote}
                onChangeText={setFeedbackNote}
                editable={!sendingFeedback}
              />

              {/* Seção de Fotos */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Fotos (opcional)
                  </Text>
                  {selectedImages.length < 5 && (
                    <TouchableOpacity
                      onPress={showImageOptions}
                      disabled={sendingFeedback}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                      }}
                    >
                      <Ionicons name="camera" size={16} color="#60A5FA" style={{ marginRight: 6 }} />
                      <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>
                        Adicionar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Grid de Fotos Selecionadas */}
                {selectedImages.length > 0 && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 8 }}
                  >
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {selectedImages.map((image, index) => (
                        <View key={index} style={{ position: 'relative' }}>
                          <Image
                            source={{ uri: image.uri }}
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 8,
                              backgroundColor: 'rgba(156, 163, 175, 0.1)',
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => removeImage(index)}
                            disabled={sendingFeedback}
                            style={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: '#EF4444',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons name="close" size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {selectedImages.length > 0 && (
                  <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}>
                    {selectedImages.length}/5 fotos selecionadas
                  </Text>
                )}
              </View>

              {/* Botões */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={skipFeedback}
                  disabled={sendingFeedback}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    alignItems: 'center',
                    borderRadius: 8,
                    backgroundColor: 'rgba(156, 163, 175, 0.2)',
                  }}
                >
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: '600' }}>
                    Pular
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={sendFeedback}
                  disabled={sendingFeedback}
                  style={{
                    flex: 2,
                    paddingVertical: 12,
                    alignItems: 'center',
                    borderRadius: 8,
                    backgroundColor: sendingFeedback ? 'rgba(34, 197, 94, 0.5)' : '#22C55E',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {sendingFeedback ? (
                      <>
                        <Ionicons name="hourglass" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                          Enviando...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="send" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                          Enviar Feedback
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </LiquidGlassCard>
        </View>
      </Modal>
    </View>
  );
}

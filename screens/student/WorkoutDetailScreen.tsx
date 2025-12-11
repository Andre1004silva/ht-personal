import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
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

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    loadRoutineDetails();
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

      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 }}>
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {routine.trainings?.map((training, index) => (
          <View key={training.id} style={{ marginBottom: 16 }}>
            <LiquidGlassCard>
              <TouchableOpacity
                onPress={() => toggleTraining(training.id)}
                activeOpacity={0.7}
              >
                {/* Header do Treino */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  </View>

                  {/* Ícone de Expandir */}
                  <Ionicons 
                    name={expandedTraining === training.id ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="#60A5FA" 
                  />
                </View>

                {/* Lista de Exercícios (Expandida) */}
                {expandedTraining === training.id && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(156, 163, 175, 0.2)' }}>
                    {training.exercises.map((exercise, idx) => (
                      <View
                        key={exercise.id}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: idx < training.exercises.length - 1 ? 12 : 0,
                          borderLeftWidth: 3,
                          borderLeftColor: '#60A5FA',
                        }}
                      >
                        <Text style={{ 
                          color: 'white', 
                          fontSize: 15, 
                          fontWeight: '600',
                          marginBottom: 8,
                        }}>
                          {exercise.name}
                        </Text>

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
                      </View>
                    ))}

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
              </TouchableOpacity>
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
    </View>
  );
}

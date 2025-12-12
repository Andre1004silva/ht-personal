import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import trainingRoutinesService, { Training, Exercise } from '../../services/trainingRoutinesService';
import { useAuth } from '../../contexts/AuthContext';

export default function WorkoutDayDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayName, setDayName] = useState('');

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    loadTrainingDetails();
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

  const formatDuration = (exercises: Exercise[]) => {
    return `${exercises.length * 3} min`;
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
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 }}>
          Exercícios ({training.exercises.length})
        </Text>

        {training.exercises.map((exercise, index) => (
          <View key={exercise.id} style={{ marginBottom: 16 }}>
            <LiquidGlassCard>
              <View style={{ padding: 4 }}>
                {/* Header do Exercício */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  {/* Número do Exercício */}
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    borderColor: '#60A5FA',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: 'bold' }}>
                      {index + 1}
                    </Text>
                  </View>

                  {/* Nome do Exercício */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                      {exercise.name}
                    </Text>
                  </View>
                </View>

                {/* Detalhes do Exercício */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                  {exercise.sets && exercise.reps && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="repeat" size={16} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 6 }}>
                        {exercise.sets}x {exercise.reps}
                      </Text>
                    </View>
                  )}

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

                  {exercise.rest_time && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="timer" size={16} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 6 }}>
                        {exercise.rest_time}s descanso
                      </Text>
                    </View>
                  )}
                </View>

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
          </View>
        ))}

        {training.exercises.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="barbell" size={64} color="#6B7280" />
            <Text style={{ color: '#9CA3AF', fontSize: 16, marginTop: 16 }}>
              Nenhum exercício programado para este treino
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

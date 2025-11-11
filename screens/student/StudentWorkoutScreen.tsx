import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';

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
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Dados dos treinos da semana
  const weekWorkouts: WorkoutDay[] = [
    {
      day: 'Seg',
      dayName: 'Segunda-feira',
      workoutName: 'Treino A - Peito e Tríceps',
      duration: '45 min',
      completed: true,
      exercises: [
        { id: '1', name: 'Supino Reto', sets: 4, reps: '8-12', weight: '80kg', rest: '90s', completed: true },
        { id: '2', name: 'Supino Inclinado', sets: 4, reps: '8-12', weight: '70kg', rest: '90s', completed: true },
        { id: '3', name: 'Crucifixo', sets: 3, reps: '12-15', weight: '16kg', rest: '60s', completed: true },
        { id: '4', name: 'Tríceps Testa', sets: 3, reps: '10-12', weight: '30kg', rest: '60s', completed: false },
        { id: '5', name: 'Tríceps Corda', sets: 3, reps: '12-15', rest: '60s', completed: false },
      ],
    },
    {
      day: 'Ter',
      dayName: 'Terça-feira',
      workoutName: 'Treino B - Costas e Bíceps',
      duration: '50 min',
      completed: true,
      exercises: [
        { id: '6', name: 'Barra Fixa', sets: 4, reps: '8-10', rest: '90s', completed: true },
        { id: '7', name: 'Remada Curvada', sets: 4, reps: '8-12', weight: '70kg', rest: '90s', completed: true },
        { id: '8', name: 'Pulley Frente', sets: 3, reps: '12-15', weight: '50kg', rest: '60s', completed: true },
        { id: '9', name: 'Rosca Direta', sets: 3, reps: '10-12', weight: '30kg', rest: '60s', completed: true },
        { id: '10', name: 'Rosca Martelo', sets: 3, reps: '12-15', weight: '14kg', rest: '60s', completed: true },
      ],
    },
    {
      day: 'Qua',
      dayName: 'Quarta-feira',
      workoutName: 'Descanso',
      duration: '0 min',
      completed: false,
      exercises: [],
    },
    {
      day: 'Qui',
      dayName: 'Quinta-feira',
      workoutName: 'Treino C - Pernas',
      duration: '60 min',
      completed: true,
      exercises: [
        { id: '11', name: 'Agachamento Livre', sets: 4, reps: '8-12', weight: '100kg', rest: '120s', completed: true },
        { id: '12', name: 'Leg Press 45°', sets: 4, reps: '12-15', weight: '180kg', rest: '90s', completed: true },
        { id: '13', name: 'Cadeira Extensora', sets: 3, reps: '12-15', weight: '60kg', rest: '60s', completed: true },
        { id: '14', name: 'Mesa Flexora', sets: 3, reps: '12-15', weight: '50kg', rest: '60s', completed: false },
        { id: '15', name: 'Panturrilha', sets: 4, reps: '15-20', weight: '80kg', rest: '45s', completed: false },
      ],
    },
    {
      day: 'Sex',
      dayName: 'Sexta-feira',
      workoutName: 'Treino D - Ombros e Abdômen',
      duration: '45 min',
      completed: false,
      exercises: [
        { id: '16', name: 'Desenvolvimento', sets: 4, reps: '8-12', weight: '50kg', rest: '90s' },
        { id: '17', name: 'Elevação Lateral', sets: 3, reps: '12-15', weight: '10kg', rest: '60s' },
        { id: '18', name: 'Elevação Frontal', sets: 3, reps: '12-15', weight: '10kg', rest: '60s' },
        { id: '19', name: 'Abdominal Remador', sets: 3, reps: '15-20', rest: '45s' },
        { id: '20', name: 'Prancha', sets: 3, reps: '60s', rest: '60s' },
      ],
    },
    {
      day: 'Sáb',
      dayName: 'Sábado',
      workoutName: 'Treino E - Full Body',
      duration: '40 min',
      completed: false,
      exercises: [
        { id: '21', name: 'Supino', sets: 3, reps: '10-12', weight: '70kg', rest: '90s' },
        { id: '22', name: 'Remada', sets: 3, reps: '10-12', weight: '60kg', rest: '90s' },
        { id: '23', name: 'Agachamento', sets: 3, reps: '10-12', weight: '80kg', rest: '90s' },
        { id: '24', name: 'Desenvolvimento', sets: 3, reps: '10-12', weight: '40kg', rest: '60s' },
      ],
    },
    {
      day: 'Dom',
      dayName: 'Domingo',
      workoutName: 'Descanso',
      duration: '0 min',
      completed: false,
      exercises: [],
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
          Meus Treinos
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>
          Plano semanal de treinos
        </Text>
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

                    {/* Botão Iniciar Treino */}
                    {!workout.completed && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.3)',
                          borderRadius: 12,
                          padding: 14,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 12,
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="play-circle" size={24} color="white" />
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                          Iniciar Treino
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </LiquidGlassCard>
          </View>
        ))}
      </ScrollView>

      <RefreshSplash 
        visible={showRefreshSplash} 
        scale={splashScale} 
        opacity={splashOpacity} 
      />
    </View>
  );
}
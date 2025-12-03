import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { treinadorPhotosService, clienteEstatisticService, clientTrainingService, agendaPointService, trainingsService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

export default function StudentDashScreen() {
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showGreeting, setShowGreeting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const [trainerImageUri, setTrainerImageUri] = useState<string | null>(null);
  const [latestStats, setLatestStats] = useState<any>(null);
  const [weeklyPoints, setWeeklyPoints] = useState<any[]>([]);
  const [clientTrainings, setClientTrainings] = useState<any[]>([]);
  const [todayTraining, setTodayTraining] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega foto do personal trainer do aluno
  const loadTrainerPhoto = async () => {
    const treinadorId = user?.treinador_id || 2;
    
    try {
      const photoUrl = treinadorPhotosService.getProfilePhotoUrl(treinadorId);
      setTrainerImageUri(photoUrl);
    } catch (error) {
      console.log('Nenhuma foto de perfil encontrada para o personal trainer');
      setTrainerImageUri(null);
    }
  };

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingData(true);

      // Carrega última estatística
      const stats = await clienteEstatisticService.getLatest(user.id);
      setLatestStats(stats);

      // Carrega pontos de treino da última semana
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const points = await agendaPointService.getAll({
        cliente_id: user.id,
        start_date: lastWeek.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
      });
      setWeeklyPoints(points);

      // Carrega treinos atribuídos ao aluno
      const trainings = await clientTrainingService.getByClientId(user.id);
      setClientTrainings(trainings);

      // Define o treino do dia (primeiro treino atribuído como exemplo)
      if (trainings.length > 0) {
        const trainingDetails = await trainingsService.getById(trainings[0].training_id);
        setTodayTraining({
          ...trainings[0],
          details: trainingDetails,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const showGreetingToast = () => {
    setShowGreeting(true);
    fadeAnim.setValue(0);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Fade out após 1.8 segundos
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowGreeting(false);
      });
    }, 1800);
  };

  useEffect(() => {
    if (user?.id) {
      loadTrainerPhoto();
      loadDashboardData();
    }
    
    // Animação de entrada do greeting
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Esconder greeting após 3 segundos
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowGreeting(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, [user?.id]);

  useEffect(() => {
    showGreetingToast();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);

    await Promise.all([
      loadDashboardData(),
      loadTrainerPhoto(),
    ]);

    // Esconde splash antes de mostrar o toast
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mostra o toast novamente após recarregar
    showGreetingToast();

    setRefreshing(false);
  };

  // Calcula frequência semanal baseada nos pontos de treino
  const getWeeklyFrequency = () => {
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const weekDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayIndex = date.getDay();
      const dayName = daysOfWeek[dayIndex];
      
      // Verifica se há treino neste dia
      const hasWorkout = weeklyPoints.some(point => {
        const pointDate = new Date(point.training_date);
        return pointDate.toDateString() === date.toDateString();
      });

      weekDays.push({
        day: dayName,
        completed: hasWorkout,
      });
    }

    return weekDays;
  };

  const weekDays = getWeeklyFrequency();
  const completedDays = weekDays.filter(d => d.completed).length;

  // Treino do dia (usa dados reais ou fallback)
  const todayWorkout = todayTraining ? {
    name: todayTraining.training_name || todayTraining.details?.name || 'Treino do Dia',
    exercises: todayTraining.details?.exercise_count || 4,
    duration: '45 min',
    completed: false,
  } : {
    name: 'Nenhum treino atribuído',
    exercises: 0,
    duration: '0 min',
    completed: false,
  };

  // Medidas corporais baseadas nas estatísticas reais
  const getMeasurements = () => {
    if (!latestStats) {
      return [
        { label: 'Peso', value: '0.0', unit: 'kg', change: '0.0' },
        { label: 'IMC', value: '0.0', unit: '', change: '0.0' },
        { label: '% Gordura', value: '0.0', unit: '%', change: '0.0' },
      ];
    }

    const weight = parseFloat(latestStats.weight || '0');
    const height = parseFloat(latestStats.height || '0') / 100; // cm para metros
    const bodyFat = parseFloat(latestStats.muscle_mass_percentage || '0');
    const imc = height > 0 ? (weight / (height * height)).toFixed(1) : '0.0';

    return [
      { label: 'Peso', value: weight.toFixed(1), unit: 'kg', change: '+2.3' },
      { label: 'IMC', value: imc, unit: '', change: '-0.2' },
      { label: '% Gordura', value: bodyFat.toFixed(1), unit: '%', change: '+1.7' },
    ];
  };

  const measurements = getMeasurements();

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
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 140,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
            colors={['white', '#93C5FD']}
            progressBackgroundColor="#141c30"
            progressViewOffset={120}
          />
        }
      >
      {/* Greeting Toast */}
      {showGreeting && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 120,
            left: 24,
            right: 24,
            zIndex: 1000,
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            }],
          }}
        >
          <View style={{
            backgroundColor: '#121b33',
            borderRadius: 16,
            borderColor: 'white',
            borderWidth: 2,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Image
              source={trainerImageUri ? { uri: trainerImageUri } : require('../../assets/images/personal.jpeg')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 12
              }}
            />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Bom treino, {user?.name || 'João'}!</Text>
          </View>
        </Animated.View>
      )}

      {/* Spacer for content */}
      <View style={{ paddingTop: 24 }} />

      {/* Frequência Semanal Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <LiquidGlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Frequência Semanal
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flame" size={20} color="#F59E0B" />
              <Text style={{ color: '#F59E0B', fontSize: 16, fontWeight: 'bold', marginLeft: 4 }}>
                {completedDays}/7
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            {weekDays.map((item, index) => (
              <View key={index} style={{ alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: item.completed ? 'rgba(96, 165, 250, 0.3)' : 'rgba(156, 163, 175, 0.2)',
                  borderWidth: 2,
                  borderColor: item.completed ? '#60A5FA' : 'rgba(156, 163, 175, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  {item.completed && (
                    <Ionicons name="checkmark" size={20} color="#60A5FA" />
                  )}
                </View>
                <Text style={{ color: item.completed ? 'white' : '#9CA3AF', fontSize: 12 }}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>

          <View style={{
            height: 8,
            backgroundColor: 'rgba(156, 163, 175, 0.2)',
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: 8,
          }}>
            <View style={{
              height: '100%',
              width: `${(completedDays / 7) * 100}%`,
              backgroundColor: '#60A5FA',
              borderRadius: 4,
            }} />
          </View>
        </LiquidGlassCard>
      </View>

      {/* Treino do Dia Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <LiquidGlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Treino do Dia
            </Text>
            <View style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '600' }}>
                Hoje
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              borderRadius: 16,
              padding: 16,
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="barbell" size={28} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                  {todayWorkout.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="fitness" size={14} color="#9CA3AF" />
                  <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 4 }}>
                    {todayWorkout.exercises} exercícios
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14, marginHorizontal: 8 }}>•</Text>
                  <Ionicons name="time" size={14} color="#9CA3AF" />
                  <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 4 }}>
                    {todayWorkout.duration}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{
              backgroundColor: 'rgba(59, 130, 246, 0.3)',
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name="play-circle" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                Iniciar Treino
              </Text>
            </View>
          </TouchableOpacity>
        </LiquidGlassCard>
      </View>

      {/* Medidas Corporais Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <LiquidGlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Medidas Corporais</Text>
            <TouchableOpacity>
              <Text style={{ color: '#93C5FD', fontSize: 14, fontWeight: '600' }}>Ver histórico</Text>
            </TouchableOpacity>
          </View>

          {measurements.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderRadius: 16,
                padding: 16,
                marginBottom: index < measurements.length - 1 ? 12 : 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>
                  {item.label}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                    {item.value}
                  </Text>
                  {item.unit && (
                    <Text style={{ color: '#9CA3AF', fontSize: 16, marginLeft: 4, marginBottom: 4 }}>
                      {item.unit}
                    </Text>
                  )}
                </View>
              </View>
              <View style={{
                backgroundColor: item.change.startsWith('+') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons 
                  name={item.change.startsWith('+') ? 'arrow-up' : 'arrow-down'} 
                  size={16} 
                  color={item.change.startsWith('+') ? '#EF4444' : '#22C55E'} 
                />
                <Text style={{ 
                  color: item.change.startsWith('+') ? '#EF4444' : '#22C55E', 
                  fontSize: 14, 
                  fontWeight: '600',
                  marginLeft: 4,
                }}>
                  {item.change}
                </Text>
              </View>
            </View>
          ))}
        </LiquidGlassCard>
      </View>

    </ScrollView>
    
    <RefreshSplash 
      visible={showRefreshSplash} 
      scale={splashScale} 
      opacity={splashOpacity} 
    />
  </View>
  );
}
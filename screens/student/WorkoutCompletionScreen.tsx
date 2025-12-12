import { View, Text, TouchableOpacity, Share } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import LiquidGlassCard from '../../components/LiquidGlassCard';

interface WorkoutCompletionScreenProps {}

export default function WorkoutCompletionScreen() {
  const params = useLocalSearchParams();
  const [currentDate, setCurrentDate] = useState('');
  
  // Dados do treino passados como parâmetros
  const workoutTime = parseInt(params.workoutTime as string) || 0;
  const completedExercises = parseInt(params.completedExercises as string) || 0;
  const totalExercises = parseInt(params.totalExercises as string) || 0;
  const trainingName = params.trainingName as string || 'Treino';
  const startTime = params.startTime as string || '';
  const endTime = params.endTime as string || '';

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    // Formatar data atual
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    setCurrentDate(formattedDate);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDayOfWeek = () => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const today = new Date().getDay();
    
    return days.map((day, index) => ({
      day,
      isToday: index === today,
      isCompleted: index === today, // Apenas hoje está concluído
    }));
  };

  const shareWorkout = async () => {
    try {
      const message = `🎉 Treino Concluído!\n\n💪 ${trainingName}\n⏱️ Tempo: ${formatTime(workoutTime)}\n✅ Exercícios: ${completedExercises}/${totalExercises}\n📅 ${currentDate}\n\n#HIGH TRAINING #TreinoCompleto`;
      
      await Share.share({
        message,
        title: 'Treino Concluído - HIGH TRAINING',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const goHome = () => {
    // Navegar para a tela inicial, removendo todas as telas anteriores
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1120' }}>
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

      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Header com Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Ionicons name="fitness" size={32} color="white" />
            <Text style={{ 
              color: 'white', 
              fontSize: 24, 
              fontWeight: 'bold',
              marginLeft: 12,
            }}>
              HIGH TRAINING
            </Text>
          </View>
          
          <Text style={{ 
            color: 'white', 
            fontSize: 32, 
            fontWeight: 'bold',
            fontStyle: 'italic',
            marginBottom: 8,
          }}>
            Parabéns!
          </Text>
          
          <Text style={{ 
            color: '#9CA3AF', 
            fontSize: 18,
          }}>
            Você concluiu o seu treino!
          </Text>
        </View>

        {/* Card Principal */}
        <LiquidGlassCard>
          <View style={{ padding: 8 }}>
            {/* Header do Card */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="fitness" size={20} color="#60A5FA" />
                <Text style={{ 
                  color: '#60A5FA', 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  marginLeft: 8,
                }}>
                  HIGH TRAINING
                </Text>
              </View>
              
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                {currentDate}
              </Text>
            </View>

            {/* Ícone Central */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="barbell" size={32} color="#22C55E" />
              </View>
              
              <Text style={{ 
                color: '#374151', 
                fontSize: 20, 
                fontWeight: 'bold',
                marginBottom: 16,
              }}>
                Treino Concluído!
              </Text>
            </View>

            {/* Estatísticas */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>
                Tempo de treino:
              </Text>
              <Text style={{ 
                color: '#374151', 
                fontSize: 32, 
                fontWeight: 'bold',
                marginBottom: 16,
              }}>
                {formatTime(workoutTime)}
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>Início:</Text>
                  <Text style={{ color: '#374151', fontSize: 14, fontWeight: '600' }}>
                    {startTime}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>Fim:</Text>
                  <Text style={{ color: '#374151', fontSize: 14, fontWeight: '600' }}>
                    {endTime}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progresso Semanal */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {getDayOfWeek().map((item, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: item.isCompleted ? '#22C55E' : 'transparent',
                      borderWidth: 2,
                      borderColor: item.isToday ? '#22C55E' : '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4,
                    }}>
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={{ 
                      color: item.isToday ? '#22C55E' : '#6B7280', 
                      fontSize: 12,
                      fontWeight: item.isToday ? '600' : 'normal',
                    }}>
                      {item.day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Botões de Ação */}
        <View style={{ marginTop: 32, gap: 16 }}>
          {/* Botão Compartilhar */}
          <TouchableOpacity
            onPress={shareWorkout}
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="share-social" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: '600',
              }}>
                Compartilhar
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botão Voltar para o Início */}
          <TouchableOpacity
            onPress={goHome}
            style={{
              backgroundColor: 'rgba(156, 163, 175, 0.3)',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(156, 163, 175, 0.5)',
            }}
          >
            <Text style={{ 
              color: '#9CA3AF', 
              fontSize: 16, 
              fontWeight: '600',
            }}>
              Voltar para o início
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

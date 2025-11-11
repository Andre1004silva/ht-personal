import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';

const screenWidth = Dimensions.get('window').width;

export default function StudentDashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showGreeting, setShowGreeting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

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
    showGreetingToast();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Esconde splash antes de mostrar o toast
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mostra o toast novamente após recarregar
    showGreetingToast();

    setRefreshing(false);
  };

  // Dados de frequência semanal
  const weekDays = [
    { day: 'Seg', completed: true },
    { day: 'Ter', completed: true },
    { day: 'Qua', completed: false },
    { day: 'Qui', completed: true },
    { day: 'Sex', completed: false },
    { day: 'Sáb', completed: false },
    { day: 'Dom', completed: false },
  ];

  // Treino do dia
  const todayWorkout = {
    name: 'Treino A - Peito e Tríceps',
    exercises: 4,
    duration: '45 min',
    completed: false,
  };

  // Medidas corporais
  const measurements = [
    { label: 'Peso', value: '75.5', unit: 'kg', change: '+0.5' },
    { label: 'IMC', value: '24.2', unit: '', change: '-0.3' },
    { label: 'Gordura', value: '18.5', unit: '%', change: '-1.2' },
  ];

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
              source={require('../../assets/images/personal.jpeg')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 12
              }}
            />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Bom treino, João!</Text>
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
                3/7
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
              width: '43%',
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
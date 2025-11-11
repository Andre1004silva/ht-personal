import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { trainingsService } from '@/services';

const screenWidth = Dimensions.get('window').width;

export default function DashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showGreeting, setShowGreeting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const [treinos, setTreinos] = useState<any[]>([]);
  const [loadingTreinos, setLoadingTreinos] = useState(true);

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
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
    loadTreinos();
  }, []);

  const loadTreinos = async () => {
    try {
      setLoadingTreinos(true);
      const data = await trainingsService.getAll();
      setTreinos(data.slice(0, 3)); // Mostra apenas os 3 primeiros
    } catch (err) {
      console.error('Erro ao carregar treinos:', err);
    } finally {
      setLoadingTreinos(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);

    // Carrega dados reais
    await loadTreinos();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Esconde splash antes de mostrar o toast
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mostra o toast novamente após recarregar
    showGreetingToast();

    setRefreshing(false);
  };

  // Dados para o gráfico de progresso circular
  const progressData = {
    labels: ['Passos', 'Calorias', 'Água'],
    data: [0.71, 0.65, 0.70]
  };

  const chartConfig = {
    backgroundGradientFrom: '#121b33',
    backgroundGradientTo: '#121b33',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
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
              source={require('@/assets/images/personal.jpeg')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                marginRight: 12
              }}
            />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Boa tarde, Samuel!</Text>
          </View>
        </Animated.View>
      )}

      {/* Spacer for content */}
      <View style={{ paddingTop: 24 }} />

      {/* Stats Card - Passos */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <LiquidGlassCard>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Passos
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
              8.500
              <Text style={{ color: '#9CA3AF', fontSize: 20, fontWeight: 'normal' }}>
                / 12.000
              </Text>
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>71%</Text>
          </View>
          {/* Progress Bar */}
          <View style={{
            height: 12,
            backgroundColor: 'rgba(156, 163, 175, 0.2)',
            borderRadius: 6,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: '71%',
              backgroundColor: '#60A5FA',
              borderRadius: 6
            }} />
          </View>
        </LiquidGlassCard>
      </View>

      {/* Daily Activity Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <LiquidGlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
              Atividade Diária
            </Text>
            <TouchableOpacity>
              <Text style={{ color: '#93C5FD', fontSize: 14, fontWeight: '600' }}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Left Side - Stats */}
            <View style={{ flex: 1 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>Passos</Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                  8.500
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: 'normal' }}>
                    / 12.000
                  </Text>
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>Calorias</Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                  520
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: 'normal' }}>
                    / 800 Cal
                  </Text>
                </Text>
              </View>

              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>Água</Text>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                  2,1
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: 'normal' }}>
                    / 3,0 L
                  </Text>
                </Text>
              </View>
            </View>

            {/* Right Side - Circular Progress Chart */}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginLeft: 16 }}>
              <ProgressChart
                data={progressData}
                width={140}
                height={140}
                strokeWidth={10}
                radius={24}
                chartConfig={{
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  color: (opacity = 1, index = 0) => {
                    const colors = ['#60A5FA', '#60A5FA', '#93C5FD'];
                    return colors[index as number] || `rgba(96, 165, 250, ${opacity})`;
                  },
                }}
                hideLegend={true}
                style={{
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        </LiquidGlassCard>
      </View>

      {/* Workouts Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <LiquidGlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Treinos</Text>
            <TouchableOpacity>
              <Text style={{ color: '#93C5FD', fontSize: 14, fontWeight: '600' }}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {loadingTreinos ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#60A5FA" />
            </View>
          ) : treinos.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="barbell-outline" size={48} color="#6B7280" />
              <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Nenhum treino encontrado</Text>
            </View>
          ) : (
            treinos.map((treino, index) => (
              <TouchableOpacity
                key={treino.id}
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: index < treinos.length - 1 ? 12 : 0,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Ionicons name="barbell" size={24} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                    {treino.name}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                    {treino.duration ? `${treino.duration} min` : treino.repeticoes ? `${treino.repeticoes} reps` : 'Treino'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {treino.carga && (
                    <Text style={{ color: '#60A5FA', fontSize: 14, marginBottom: 4 }}>{treino.carga} kg</Text>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
                </View>
              </TouchableOpacity>
            ))
          )}
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

import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Animated, RefreshControl } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';

const screenWidth = Dimensions.get('window').width;

export default function DashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showGreeting, setShowGreeting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  
  // Animações para as bolas decorativas
  const ball1Anim = useRef(new Animated.Value(0)).current;
  const ball2Anim = useRef(new Animated.Value(0)).current;
  const ball3Anim = useRef(new Animated.Value(0)).current;

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
    
    // Animação das bolas decorativas
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ball1Anim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(ball1Anim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ball2Anim, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(ball2Anim, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ball3Anim, {
            toValue: 1,
            duration: 12000,
            useNativeDriver: true,
          }),
          Animated.timing(ball3Anim, {
            toValue: 0,
            duration: 12000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);

    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));

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
      {/* Decorative Background Balls */}
      <Svg
        height="100%"
        width="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <Defs>
          <RadialGradient id="grad1" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad2" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="grad3" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        
        <Circle cx="-50" cy="150" r="200" fill="url(#grad1)" />
        <Circle cx="350" cy="100" r="150" fill="url(#grad2)" />
        <Circle cx="200" cy="600" r="180" fill="url(#grad3)" />
      </Svg>
      
      {/* Animated Decorative Balls */}
      <Animated.View
        style={{
          position: 'absolute',
          top: ball1Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 200],
          }),
          left: ball1Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-100, -50],
          }),
          opacity: ball1Anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.5, 0.3],
          }),
        }}
      >
        <Svg height="400" width="400">
          <Circle cx="200" cy="200" r="200" fill="url(#grad1)" />
        </Svg>
      </Animated.View>
      
      <Animated.View
        style={{
          position: 'absolute',
          top: ball2Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 150],
          }),
          right: ball2Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-80, -30],
          }),
          opacity: ball2Anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.25, 0.4, 0.25],
          }),
        }}
      >
        <Svg height="300" width="300">
          <Circle cx="150" cy="150" r="150" fill="url(#grad2)" />
        </Svg>
      </Animated.View>
      
      <Animated.View
        style={{
          position: 'absolute',
          bottom: ball3Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 200],
          }),
          left: ball3Anim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 150],
          }),
          opacity: ball3Anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.45, 0.3],
          }),
        }}
      >
        <Svg height="360" width="360">
          <Circle cx="180" cy="180" r="180" fill="url(#grad3)" />
        </Svg>
      </Animated.View>

      
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
            tintColor="#3B82F6"
            colors={['#3B82F6', '#93C5FD']}
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
            borderColor: '#3B82F6',
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
              source={require('../assets/images/personal.jpeg')}
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
              backgroundColor: '#3B82F6',
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
                <Text style={{ color: '#3B82F6', fontSize: 24, fontWeight: 'bold' }}>
                  8.500
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: 'normal' }}>
                    / 12.000
                  </Text>
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>Calorias</Text>
                <Text style={{ color: '#3B82F6', fontSize: 24, fontWeight: 'bold' }}>
                  520
                  <Text style={{ color: '#9CA3AF', fontSize: 16, fontWeight: 'normal' }}>
                    / 800 Cal
                  </Text>
                </Text>
              </View>

              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>Água</Text>
                <Text style={{ color: '#3B82F6', fontSize: 24, fontWeight: 'bold' }}>
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
                    const colors = ['#3B82F6', '#2563EB', '#93C5FD'];
                    return colors[index as number] || `rgba(59, 130, 246, ${opacity})`;
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

          {/* Workout Item 1 */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
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
              <Ionicons name="walk" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                Caminhada Matinal
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>3,2 km</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: 'white', fontSize: 14 }}>Hoje</Text>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </View>
          </TouchableOpacity>

          {/* Workout Item 2 */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
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
              <Ionicons name="fitness" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                Treino de Força
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>45 min</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: 'white', fontSize: 14 }}>Hoje</Text>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </View>
          </TouchableOpacity>

          {/* Workout Item 3 */}
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              borderRadius: 16,
              padding: 16,
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
              <Ionicons name="bicycle" size={24} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 4 }}>
                Ciclismo
              </Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>12,5 km</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: 'white', fontSize: 14 }}>Ontem</Text>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </View>
          </TouchableOpacity>
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

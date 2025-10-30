import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image, Animated, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ProgressChart } from 'react-native-chart-kit';
import Svg, { Circle } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

export default function DashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showGreeting, setShowGreeting] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const showGreetingToast = () => {
    setShowGreeting(true);
    fadeAnim.setValue(0);

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Fade out após 3 segundos
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowGreeting(false);
      });
    }, 3000);
  };

  useEffect(() => {
    showGreetingToast();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));

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
    <ScrollView
      className="flex-1 bg-[#0B1120]"
      contentContainerStyle={{
        paddingTop: 140,
        paddingBottom: 100,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="white"
          colors={['white']}
          progressBackgroundColor="white"
        />
      }
    >
      {/* Greeting Toast */}
      {showGreeting && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 130,
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
        <View style={{
          backgroundColor: '#141c30',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}>
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
        </View>
      </View>

      {/* Daily Activity Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <View style={{
          backgroundColor: '#141c30',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}>
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
                  backgroundGradientFrom: '#141c30',
                  backgroundGradientTo: '#141c30',
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
        </View>
      </View>

      {/* Workouts Card */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <View style={{
          backgroundColor: '#141c30',
          borderRadius: 24,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}>
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
        </View>
      </View>

    </ScrollView>
  );
}

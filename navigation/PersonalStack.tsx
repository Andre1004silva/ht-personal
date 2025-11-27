import { View, Text, Image, useWindowDimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashScreen from '../screens/personal/DashScreen';
import AlunosScreen from '../screens/personal/AlunosScreen';
import TreinosScreen from '../screens/personal/TreinosScreen';
import ExerciciosScreen from '../screens/personal/ExerciciosScreen';
import PerfilScreen from '../screens/personal/PerfilScreen';
import BottomNavigation from '../components/BottomNavigation';

export default function PersonalStack() {
  const [activeTab, setActiveTab] = useState<'dash' | 'alunos' | 'treinos' | 'exercicios' | 'perfil'>('dash');
  const { width } = useWindowDimensions();
  
  const logoSize = width * 0.15;
  const shimmer = useSharedValue(0);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Verifica se há uma tab específica para ativar
    const checkActiveTab = async () => {
      try {
        const savedTab = await AsyncStorage.getItem('@HighTraining:activeTab');
        if (savedTab && ['dash', 'alunos', 'treinos', 'exercicios', 'perfil'].includes(savedTab)) {
          setActiveTab(savedTab as 'dash' | 'alunos' | 'treinos' | 'exercicios' | 'perfil');
          // Remove o item após usar para não interferir na próxima navegação
          await AsyncStorage.removeItem('@HighTraining:activeTab');
        }
      } catch (error) {
        console.log('Erro ao verificar tab ativa:', error);
      }
    };
    
    checkActiveTab();
  }, []);
  
  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmer.value * 0.2,
    };
  });

  const renderScreen = () => {
    switch (activeTab) {
      case 'dash':
        return <DashScreen />;
      case 'alunos':
        return <AlunosScreen />;
      case 'treinos':
        return <TreinosScreen />;
      case 'exercicios':
        return <ExerciciosScreen />;
      case 'perfil':
        return <PerfilScreen />;
      default:
        return <DashScreen />;
    }
  };

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Screen Content */}
      {renderScreen()}
      
      {/* Header */}
      <View 
        className="rounded-b-[40px] overflow-hidden"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        {/* Borda brilhante externa */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.08)', 'rgba(139, 92, 246, 0.05)', 'rgba(59, 130, 246, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 40,
          }}
        />
        
        {/* Container interno com padding para criar efeito de borda */}
        <View style={{ padding: 1.5 }}>
          <BlurView 
            intensity={50} 
            tint="dark"
            className="rounded-b-[40px] overflow-hidden"
            style={{
              backgroundColor: 'rgba(20, 28, 48, 0.05)',
            }}
          >
            {/* Gradiente líquido animado */}
            <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, animatedShimmerStyle]}>
              <LinearGradient
                colors={[
                  'rgba(59, 130, 246, 0.04)',
                  'rgba(139, 92, 246, 0.02)',
                  'rgba(59, 130, 246, 0.04)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
            
            {/* Reflexo superior */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
              }}
            />
            
            <View className="pt-[36px] pb-[18px] px-6">
              <View className="flex-row items-center justify-center">
                <Image 
                  source={require('../assets/logo.png')} 
                  style={{
                    width: logoSize,
                    height: logoSize,
                    resizeMode: 'contain',
                  }}
                />
                <Text className="text-white text-2xl font-bold ml-2">
                  High<Text className="font-normal text-[#60A5FA]">Training</Text>
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </View>
    </View>
  );
}

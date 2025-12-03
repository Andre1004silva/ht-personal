import { View, Text, Image, useWindowDimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import StudentDashScreen from '../screens/student/StudentDashScreen';
import StudentWorkoutScreen from '../screens/student/StudentWorkoutScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import BottomNavigation from '../components/BottomNavigation';

type StudentTabType = 'dash' | 'treinos' | 'perfil';

/**
 * AlunoStack - Navegação para alunos
 * 
 * Gerencia a navegação entre as 3 telas do aluno:
 * - Dashboard (frequência, treino do dia, medidas)
 * - Treinos (plano semanal com exercícios)
 * - Perfil (dados pessoais, objetivos, evolução)
 */
export default function AlunoStack() {
  const [activeTab, setActiveTab] = useState<StudentTabType>('dash');
  const { width } = useWindowDimensions();
  
  const logoSize = width * 0.18;
  const shimmer = useSharedValue(0);
  
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  
  const animatedShimmerStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.3 + shimmer.value * 0.2,
    };
  });

  const renderScreen = () => {
    switch (activeTab) {
      case 'dash':
        return <StudentDashScreen />;
      case 'treinos':
        return <StudentWorkoutScreen />;
      case 'perfil':
        return <StudentProfileScreen />;
      default:
        return <StudentDashScreen />;
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
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
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
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
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
                height: '40%',
              }}
            />
            
            <View style={{ paddingTop: 40, paddingBottom: 6, paddingHorizontal: 16 }}>        
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
          onTabChange={(tab) => setActiveTab(tab as StudentTabType)}
          userType="student"
        />
      </View>
    </View>
  );
}

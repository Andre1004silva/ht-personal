import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';

type TabType = 'dash' | 'alunos' | 'treinos' | 'exercicios' | 'perfil';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs: { id: TabType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'dash', label: 'Início', icon: 'home' },
    { id: 'alunos', label: 'Alunos', icon: 'people' },
    { id: 'treinos', label: 'Treinos', icon: 'barbell' },
    { id: 'exercicios', label: 'Exercícios', icon: 'heart-circle' },
    { id: 'perfil', label: 'Perfil', icon: 'person-circle' },
  ];
  
  // Animação para efeito liquid
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

  return (
    <View className="rounded-t-[40px] overflow-hidden">
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
          intensity={30} 
          tint="dark"
          className="rounded-t-[40px] overflow-hidden"
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
            end={{ x: 0, y: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
            }}
          />
          
          <View className="pt-4 pb-6 px-4">
            <View className="flex-row justify-around items-center">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => onTabChange(tab.id)}
                  className="items-center py-2"
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={28} 
                    color={activeTab === tab.id ? '#3B82F6' : '#9CA3AF'} 
                  />
                  <Text
                    className={`text-xs mt-1 ${
                      activeTab === tab.id ? 'text-[#3B82F6] font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

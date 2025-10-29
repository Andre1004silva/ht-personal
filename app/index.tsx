import { Stack } from 'expo-router';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import DashScreen from '../screens/DashScreen';
import AlunosScreen from '../screens/AlunosScreen';
import TreinosScreen from '../screens/TreinosScreen';
import ExerciciosScreen from '../screens/ExerciciosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import BottomNavigation from '../components/BottomNavigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dash' | 'alunos' | 'treinos' | 'exercicios' | 'perfil'>('dash');
  const { width } = useWindowDimensions();
  
  // Define o tamanho proporcional à largura da tela
  const logoSize = width * 0.15; // 20% da largura da tela

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
    <View className="flex-1 bg-[#0B1F1F]">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="bg-[#1A3333] pt-8 pb-4 px-6 rounded-b-[40px]">
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
            High<Text className="font-normal text-[#00C896]">Training</Text>
          </Text>
        </View>
      </View>

      {/* Screen Content */}
      {renderScreen()}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </View>
  );
}

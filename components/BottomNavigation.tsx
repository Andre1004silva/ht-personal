import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type BottomNavigationProps = {
  activeTab: 'dash' | 'alunos' | 'treinos' | 'exercicios' | 'perfil';
  onTabChange: (tab: 'dash' | 'alunos' | 'treinos' | 'exercicios' | 'perfil') => void;
};

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <View className="bg-[#1A3333] flex-row rounded-t-[40px] pb-[18px]">
      <TouchableOpacity 
        className="flex-1 items-center py-3 rounded-t-[40px]"
        onPress={() => onTabChange('dash')}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={activeTab === 'dash' ? '#00C896' : '#888'} 
        />
        <Text className={`text-xs mt-1 ${activeTab === 'dash' ? 'text-[#00C896]' : 'text-white'}`}>
          Início
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 items-center py-3"
        onPress={() => onTabChange('alunos')}
      >
        <Ionicons 
          name="people-outline" 
          size={24} 
          color={activeTab === 'alunos' ? '#00C896' : '#888'} 
        />
        <Text className={`text-xs mt-1 ${activeTab === 'alunos' ? 'text-[#00C896]' : 'text-white'}`}>
          Alunos
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 items-center py-3"
        onPress={() => onTabChange('treinos')}
      >
        <Ionicons 
          name="barbell-outline" 
          size={24} 
          color={activeTab === 'treinos' ? '#00C896' : '#888'} 
        />
        <Text className={`text-xs mt-1 ${activeTab === 'treinos' ? 'text-[#00C896]' : 'text-white'}`}>
          Treinos
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 items-center py-3"
        onPress={() => onTabChange('exercicios')}
      >
        <Ionicons 
          name="fitness-outline" 
          size={24} 
          color={activeTab === 'exercicios' ? '#00C896' : '#888'} 
        />
        <Text className={`text-xs mt-1 ${activeTab === 'exercicios' ? 'text-[#00C896]' : 'text-white'}`}>
          Exercícios
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="flex-1 items-center py-3"
        onPress={() => onTabChange('perfil')}
      >
        <Ionicons 
          name="person-outline" 
          size={24} 
          color={activeTab === 'perfil' ? '#00C896' : '#888'} 
        />
        <Text className={`text-xs mt-1 ${activeTab === 'perfil' ? 'text-[#00C896]' : 'text-white'}`}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

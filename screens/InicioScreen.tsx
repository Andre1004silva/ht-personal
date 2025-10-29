import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InicioScreen() {
  return (
    <ScrollView className="flex-1">
      {/* Action Icons */}
      <View className="flex-row justify-around py-6 px-6">
        <TouchableOpacity className="items-center">
          <View className="w-16 h-16 rounded-full bg-[#47c98a]/20 items-center justify-center mb-2">
            <Ionicons name="chatbubbles-outline" size={28} color="#47c98a" />
          </View>
          <Text className="text-gray-700 text-sm">Feedbacks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <View className="w-16 h-16 rounded-full bg-[#47c98a]/20 items-center justify-center mb-2">
            <Ionicons name="calendar-outline" size={28} color="#47c98a" />
          </View>
          <Text className="text-gray-700 text-sm">Atualizações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center">
          <View className="w-16 h-16 rounded-full bg-[#47c98a]/20 items-center justify-center mb-2">
            <Ionicons name="paper-plane-outline" size={28} color="#47c98a" />
          </View>
          <Text className="text-gray-700 text-sm">Notificações</Text>
        </TouchableOpacity>
      </View>

      {/* Seus Alunos Section */}
      <View className="px-6 pb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">Seus alunos</Text>
        
        <View className="flex-row gap-3 mb-3">
          <TouchableOpacity className="flex-1 bg-[#47c98a] rounded-2xl p-5 h-32 justify-center">
            <Ionicons name="person-add-outline" size={32} color="white" />
            <Text className="text-white font-bold text-base mt-2">Adicionar{'\n'}alunos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 bg-[#47c98a] rounded-2xl p-5 h-32 justify-center">
            <Ionicons name="link-outline" size={32} color="white" />
            <Text className="text-white font-bold text-base mt-2">Link de{'\n'}cadastro</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity className="bg-[#155e28] rounded-2xl p-5 flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Ionicons name="people" size={32} color="white" />
            <View className="ml-4">
              <Text className="text-white font-bold text-base mb-2">Alunos</Text>
              <View className="flex-row gap-2">
                <View className="bg-[#47c98a] rounded-full px-3 py-1">
                  <Text className="text-white font-semibold text-xs">Ativos: 1</Text>
                </View>
                <View className="bg-orange-500 rounded-full px-3 py-1">
                  <Text className="text-white font-semibold text-xs">Inativos: 0</Text>
                </View>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row gap-3">
          <TouchableOpacity className="flex-1 bg-[#47c98a]/20 rounded-2xl p-5 h-24 justify-center">
            <Text className="text-[#165426] font-semibold text-sm">Grupo de alunos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 bg-[#47c98a]/20 rounded-2xl p-5 h-24 justify-center">
            <Text className="text-[#165426] font-semibold text-sm">Grupo de desafio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

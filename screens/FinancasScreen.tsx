import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FinancasScreen() {
  return (
    <ScrollView className="flex-1 bg-[#0B1F1F]">
      <View className="px-6 py-6">
        <Text className="text-xl font-bold text-white mb-4">Finanças</Text>
        
        {/* Resumo Financeiro */}
        <View className="bg-[#1A3333] rounded-2xl p-6 mb-4">
          <Text className="text-gray-400 text-sm mb-2">Receita Total</Text>
          <Text className="text-white text-3xl font-bold">R$ 0,00</Text>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-[#1A3333] rounded-2xl p-4">
            <Ionicons name="trending-up" size={24} color="#00C896" />
            <Text className="text-gray-400 text-xs mt-2">Recebido</Text>
            <Text className="text-white text-lg font-bold">R$ 0,00</Text>
          </View>
          
          <View className="flex-1 bg-[#1A3333] rounded-2xl p-4">
            <Ionicons name="trending-down" size={24} color="#00C896" />
            <Text className="text-gray-400 text-xs mt-2">Pendente</Text>
            <Text className="text-white text-lg font-bold">R$ 0,00</Text>
          </View>
        </View>

        {/* Transações Recentes */}
        <Text className="text-lg font-bold text-white mb-3">Transações Recentes</Text>
        <View className="bg-[#1A3333] rounded-2xl p-6 items-center">
          <Ionicons name="receipt-outline" size={48} color="#00C896" />
          <Text className="text-white mt-2">Nenhuma transação ainda</Text>
        </View>
      </View>
    </ScrollView>
  );
}

import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function FinancasScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <ScrollView 
      className="flex-1 bg-[#0B1F1F]"
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

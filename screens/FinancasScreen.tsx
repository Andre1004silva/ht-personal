import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import { Ionicons } from '@expo/vector-icons';

export default function FinancasScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

  return (
    <View className="flex-1">
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
          tintColor="#3B82F6"
          colors={['#3B82F6', '#93C5FD']}
          progressBackgroundColor="#141c30"
          progressViewOffset={120}
        />
      }
    >
      <View style={{ paddingHorizontal: 24 }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Finanças</Text>
        
        {/* Resumo Financeiro */}
        <View style={{
          backgroundColor: '#141c30',
          borderRadius: 24,
          padding: 24,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>Receita Total</Text>
          <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>R$ 0,00</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#141c30',
            borderRadius: 20,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Ionicons name="trending-up" size={28} color="#3B82F6" />
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 12 }}>Recebido</Text>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>R$ 0,00</Text>
          </View>
          
          <View style={{
            flex: 1,
            backgroundColor: '#141c30',
            borderRadius: 20,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Ionicons name="trending-down" size={28} color="#3B82F6" />
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 12 }}>Pendente</Text>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>R$ 0,00</Text>
          </View>
        </View>

        {/* Transações Recentes */}
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Transações Recentes</Text>
        <View style={{
          backgroundColor: '#141c30',
          borderRadius: 24,
          padding: 32,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}>
          <Ionicons name="receipt-outline" size={48} color="#3B82F6" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 16 }}>Nenhuma transação ainda</Text>
        </View>
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

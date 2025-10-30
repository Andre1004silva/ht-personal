import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';

export default function InicioScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
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
      {/* Action Icons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, paddingBottom: 24 }}>
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <Ionicons name="chatbubbles-outline" size={28} color="#3B82F6" />
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Feedbacks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <Ionicons name="calendar-outline" size={28} color="#3B82F6" />
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Atualizações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ alignItems: 'center' }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <Ionicons name="paper-plane-outline" size={28} color="#3B82F6" />
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Notificações</Text>
        </TouchableOpacity>
      </View>

      {/* Seus Alunos Section */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Seus alunos</Text>
        
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: '#3B82F6',
            borderRadius: 24,
            padding: 20,
            height: 128,
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Ionicons name="person-add-outline" size={32} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Adicionar{'\n'}alunos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: '#3B82F6',
            borderRadius: 24,
            padding: 20,
            height: 128,
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Ionicons name="link-outline" size={32} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Link de{'\n'}cadastro</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={{
          backgroundColor: '#141c30',
          borderRadius: 24,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="people" size={32} color="#3B82F6" />
            <View style={{ marginLeft: 16 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Alunos</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ backgroundColor: '#3B82F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Ativos: 1</Text>
                </View>
                <View style={{ backgroundColor: '#2563EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Inativos: 0</Text>
                </View>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#93C5FD" />
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: 24,
            padding: 20,
            height: 96,
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 14 }}>Grupo de alunos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={{
            flex: 1,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderRadius: 24,
            padding: 20,
            height: 96,
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 14 }}>Grupo de desafio</Text>
          </TouchableOpacity>
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

import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PerfilScreen() {
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
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Image */}
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      >
        {/* Blur Overlay */}
        <BlurView
          intensity={50}
          tint="dark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </ImageBackground>
      
      <ScrollView 
      className="flex-1"
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
      {/* Header com Foto de Perfil */}
      <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {/* Foto de Perfil */}
          <Image
            source={require('../assets/images/personal.jpeg')}
            style={{ 
              width: 120, 
              height: 120, 
              borderRadius: 60,
              marginBottom: 16,
              borderWidth: 4,
              borderColor: '#3B82F6'
            }}
          />
          
          {/* Nome e Profissão */}
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
            Samuel Silva
          </Text>
          <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Personal Trainer
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            CREF: 123456-G/SP
          </Text>
        </View>

        {/* Estatísticas */}
        <LiquidGlassCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#3B82F6', fontSize: 28, fontWeight: 'bold' }}>42</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Alunos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#3B82F6', fontSize: 28, fontWeight: 'bold' }}>5</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Anos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#3B82F6', fontSize: 28, fontWeight: 'bold' }}>4.8</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Avaliação</Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Especialidades */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Especialidades
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ 
              backgroundColor: '#1E3A8A', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#3B82F6'
            }}>
              <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>Hipertrofia</Text>
            </View>
            <View style={{ 
              backgroundColor: '#1E3A8A', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#3B82F6'
            }}>
              <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>Emagrecimento</Text>
            </View>
            <View style={{ 
              backgroundColor: '#1E3A8A', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#3B82F6'
            }}>
              <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>Funcional</Text>
            </View>
            <View style={{ 
              backgroundColor: '#1E3A8A', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#3B82F6'
            }}>
              <Text style={{ color: '#3B82F6', fontSize: 14, fontWeight: '600' }}>Reabilitação</Text>
            </View>
          </View>
        </View>

        {/* Menu de Opções */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Configurações
          </Text>

          {/* Editar Perfil */}
          <LiquidGlassCard style={{ marginBottom: 12 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.7}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="person-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Editar Perfil
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* Notificações */}
          <LiquidGlassCard style={{ marginBottom: 12 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.7}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="notifications-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Notificações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* Planos e Assinatura */}
          <LiquidGlassCard style={{ marginBottom: 12 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.7}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="card-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Planos e Assinatura
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* Ajuda e Suporte */}
          <LiquidGlassCard style={{ marginBottom: 12 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.7}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Ajuda e Suporte
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* Configurações */}
          <LiquidGlassCard style={{ marginBottom: 12 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              activeOpacity={0.7}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="settings-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Configurações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>
        </View>

        {/* Botão de Sair */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#EF4444'
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600' }}>
            Sair da Conta
          </Text>
        </TouchableOpacity>

        {/* Versão do App */}
        <Text style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
          Versão 1.0.0
        </Text>
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

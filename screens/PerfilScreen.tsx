import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilScreen() {
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
              borderColor: '#C4F82A'
            }}
          />
          
          {/* Nome e Profissão */}
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
            Samuel Silva
          </Text>
          <Text style={{ color: '#00C896', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Personal Trainer
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            CREF: 123456-G/SP
          </Text>
        </View>

        {/* Estatísticas */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          backgroundColor: '#1A3333',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#C4F82A', fontSize: 28, fontWeight: 'bold' }}>42</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Alunos</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#C4F82A', fontSize: 28, fontWeight: 'bold' }}>5</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Anos</Text>
          </View>
          <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#C4F82A', fontSize: 28, fontWeight: 'bold' }}>4.8</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Avaliação</Text>
          </View>
        </View>

        {/* Especialidades */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Especialidades
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ 
              backgroundColor: '#1A3333', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#00C896'
            }}>
              <Text style={{ color: '#00C896', fontSize: 14, fontWeight: '600' }}>Hipertrofia</Text>
            </View>
            <View style={{ 
              backgroundColor: '#1A3333', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#00C896'
            }}>
              <Text style={{ color: '#00C896', fontSize: 14, fontWeight: '600' }}>Emagrecimento</Text>
            </View>
            <View style={{ 
              backgroundColor: '#1A3333', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#00C896'
            }}>
              <Text style={{ color: '#00C896', fontSize: 14, fontWeight: '600' }}>Funcional</Text>
            </View>
            <View style={{ 
              backgroundColor: '#1A3333', 
              paddingHorizontal: 16, 
              paddingVertical: 10, 
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#00C896'
            }}>
              <Text style={{ color: '#00C896', fontSize: 14, fontWeight: '600' }}>Reabilitação</Text>
            </View>
          </View>
        </View>

        {/* Menu de Opções */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Configurações
          </Text>

          {/* Editar Perfil */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#1A3333',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="person-outline" size={20} color="#00C896" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Editar Perfil
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
          </TouchableOpacity>

          {/* Notificações */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#1A3333',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="notifications-outline" size={20} color="#00C896" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Notificações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
          </TouchableOpacity>

          {/* Planos e Assinatura */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#1A3333',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="card-outline" size={20} color="#00C896" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Planos e Assinatura
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
          </TouchableOpacity>

          {/* Ajuda e Suporte */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#1A3333',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="help-circle-outline" size={20} color="#00C896" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Ajuda e Suporte
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
          </TouchableOpacity>

          {/* Configurações */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#1A3333',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="settings-outline" size={20} color="#00C896" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Configurações
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C4F82A" />
          </TouchableOpacity>
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
  );
}

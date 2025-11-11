import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dados mockados do profissional
const professionalData = {
  id: '1',
  name: 'Samuel Silva',
  profession: 'Personal Trainer',
  cref: '123456-G/SP',
  profileImage: require('@/assets/images/personal.jpeg'),
  bio: 'Especialista em transformação corporal com foco em resultados sustentáveis e saúde integral.',
  stats: {
    students: 42,
    yearsExperience: 5,
    rating: 4.8,
    totalRatings: 127
  },
  specialties: [
    { id: '1', name: 'Hipertrofia', icon: 'barbell-outline' },
    { id: '2', name: 'Emagrecimento', icon: 'flame-outline' },
    { id: '3', name: 'Funcional', icon: 'fitness-outline' },
    { id: '4', name: 'Reabilitação', icon: 'medical-outline' }
  ],
  certifications: [
    { id: '1', name: 'Educação Física - Bacharelado', institution: 'USP', year: 2018 },
    { id: '2', name: 'Treinamento Funcional', institution: 'NSCA', year: 2019 },
    { id: '3', name: 'Nutrição Esportiva', institution: 'ISSN', year: 2020 }
  ],
  contact: {
    email: 'samuel.silva@personal.com',
    phone: '+55 11 98765-4321',
    instagram: '@samuelsilva_personal',
    whatsapp: '+5511987654321'
  },
  workingHours: {
    weekdays: '06:00 - 22:00',
    saturday: '08:00 - 14:00',
    sunday: 'Fechado'
  },
  location: {
    gym: 'Smart Fit - Paulista',
    address: 'Av. Paulista, 1234 - São Paulo, SP',
    coordinates: { lat: -23.561684, lng: -46.655981 }
  },
  pricing: {
    individual: {
      monthly: 450,
      quarterly: 1200,
      semester: 2200
    },
    duo: {
      monthly: 350,
      quarterly: 950,
      semester: 1700
    },
    online: {
      monthly: 250,
      quarterly: 650,
      semester: 1100
    }
  },
  availability: {
    monday: ['06:00', '07:00', '08:00', '18:00', '19:00', '20:00'],
    tuesday: ['06:00', '07:00', '08:00', '18:00', '19:00', '20:00'],
    wednesday: ['06:00', '07:00', '08:00', '18:00', '19:00', '20:00'],
    thursday: ['06:00', '07:00', '08:00', '18:00', '19:00', '20:00'],
    friday: ['06:00', '07:00', '08:00', '18:00', '19:00', '20:00'],
    saturday: ['08:00', '09:00', '10:00', '11:00', '12:00'],
    sunday: []
  }
};

export default function PerfilScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const { signOut, user, userType } = useAuth();

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    // Simula carregamento de dados (substitua com sua lógica real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#0B1120]">
      {/* Background Video */}
      <VideoView
        player={videoPlayer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        contentFit="cover"
        nativeControls={false}
      />
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
          tintColor="#60A5FA"
          colors={['#60A5FA', '#93C5FD']}
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
            source={professionalData.profileImage}
            style={{ 
              width: 120, 
              height: 120, 
              borderRadius: 60,
              marginBottom: 16,
              borderWidth: 4,
              borderColor: '#60A5FA'
            }}
          />
          
          {/* Nome e Profissão */}
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
            {professionalData.name}
          </Text>
          <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            {professionalData.profession}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
            CREF: {professionalData.cref}
          </Text>
        </View>

        {/* Estatísticas */}
        <LiquidGlassCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{professionalData.stats.students}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Alunos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{professionalData.stats.yearsExperience}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Anos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{professionalData.stats.rating}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Avaliação</Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Sobre */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Sobre
          </Text>
          <LiquidGlassCard>
            <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20 }}>
              {professionalData.bio}
            </Text>
          </LiquidGlassCard>
        </View>

        {/* Especialidades */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Especialidades
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {professionalData.specialties.map((specialty) => (
              <View 
                key={specialty.id}
                style={{ 
                  backgroundColor: '#1E3A8A', 
                  paddingHorizontal: 16, 
                  paddingVertical: 10, 
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#60A5FA'
                }}
              >
                <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>{specialty.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Certificações */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Formação e Certificações
          </Text>
          {professionalData.certifications.map((cert) => (
            <LiquidGlassCard key={cert.id} style={{ marginBottom: 12 }}>
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
                  <Ionicons name="school-outline" size={20} color="#60A5FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 2 }}>
                    {cert.name}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                    {cert.institution} • {cert.year}
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>
          ))}
        </View>

        {/* Localização */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Localização
          </Text>
          <LiquidGlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Ionicons name="location-outline" size={20} color="#60A5FA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
                  {professionalData.location.gym}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {professionalData.location.address}
                </Text>
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Horários de Atendimento */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Horários de Atendimento
          </Text>
          <LiquidGlassCard>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Segunda a Sexta</Text>
                <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>
                  {professionalData.workingHours.weekdays}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(156, 163, 175, 0.2)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Sábado</Text>
                <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>
                  {professionalData.workingHours.saturday}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(156, 163, 175, 0.2)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Domingo</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600' }}>
                  {professionalData.workingHours.sunday}
                </Text>
              </View>
            </View>
          </LiquidGlassCard>
        </View>

        {/* Contato */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Contato
          </Text>
          
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
                  backgroundColor: 'rgba(34, 197, 94, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="logo-whatsapp" size={20} color="#22C55E" />
                </View>
                <View>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>WhatsApp</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{professionalData.contact.phone}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

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
                  backgroundColor: 'rgba(236, 72, 153, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}>
                  <Ionicons name="logo-instagram" size={20} color="#EC4899" />
                </View>
                <View>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Instagram</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{professionalData.contact.instagram}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>

          <LiquidGlassCard>
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
                  <Ionicons name="mail-outline" size={20} color="#60A5FA" />
                </View>
                <View>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>Email</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{professionalData.contact.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </LiquidGlassCard>
        </View>

        {/* Menu de Opções */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Configurações
          </Text>

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
                <Ionicons name="card-outline" size={20} color="#60A5FA" />
              </View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Planos e Assinatura
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
                <Ionicons name="settings-outline" size={20} color="#60A5FA" />
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
          onPress={handleLogout}
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

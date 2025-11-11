import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

// Dados mockados do aluno
const studentData = {
  id: '1',
  name: 'João Pedro Santos',
  email: 'joao.santos@email.com',
  phone: '+55 11 98765-1234',
  profileImage: require('../../assets/images/personal.jpeg'),
  memberSince: 'Março 2024',
  plan: 'Premium Mensal',
  nextPayment: '15/12/2024',
  personalTrainer: {
    name: 'Samuel Silva',
    cref: '123456-G/SP',
    image: require('../../assets/images/personal.jpeg'),
  },
  stats: {
    workoutsCompleted: 45,
    currentStreak: 5,
    totalDays: 90,
    avgPerWeek: 3.5,
  },
  goals: [
    { id: '1', name: 'Ganhar Massa Muscular', icon: 'barbell', progress: 65 },
    { id: '2', name: 'Perder Gordura', icon: 'flame', progress: 40 },
    { id: '3', name: 'Melhorar Condicionamento', icon: 'fitness', progress: 75 },
  ],
  measurements: {
    weight: { current: 75.5, initial: 78.0, goal: 72.0 },
    bodyFat: { current: 18.5, initial: 22.0, goal: 15.0 },
    muscle: { current: 61.5, initial: 58.0, goal: 65.0 },
  },
};

export default function StudentProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const { signOut } = useAuth();

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowRefreshSplash(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshing(false);
  };

  const handleLogout = async () => {
    console.log('handleLogout chamado');
    
    // Tenta usar Alert nativo, se falhar, executa direto
    try {
      if (Alert && Alert.alert) {
        Alert.alert(
          'Sair da Conta',
          'Tem certeza que deseja sair?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => console.log('Cancelado'),
            },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: async () => {
                console.log('Confirmado logout');
                try {
                  await signOut();
                  console.log('SignOut executado');
                  router.replace('/login');
                } catch (error) {
                  console.error('Erro no logout:', error);
                }
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        // Fallback: executa logout direto se Alert não estiver disponível
        console.log('Alert não disponível, executando logout direto');
        await signOut();
        console.log('SignOut executado');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Erro ao mostrar Alert:', error);
      // Se houver erro, executa logout direto
      await signOut();
      router.replace('/login');
    }
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
        intensity={30}
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
          paddingTop: 120,
          paddingBottom: 140,
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
            <View style={{ position: 'relative', marginBottom: 16 }}>
              <Image
                source={studentData.profileImage}
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: '#60A5FA'
                }}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#60A5FA',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: '#0B1120',
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Nome */}
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
              {studentData.name}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
              Membro desde {studentData.memberSince}
            </Text>
            
            {/* Badge do Plano */}
            <View style={{
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#60A5FA',
            }}>
              <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>
                {studentData.plan}
              </Text>
            </View>
          </View>

          {/* Estatísticas de Treino */}
          <LiquidGlassCard style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>
                  {studentData.stats.workoutsCompleted}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Treinos</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flame" size={24} color="#F59E0B" />
                  <Text style={{ color: '#F59E0B', fontSize: 28, fontWeight: 'bold', marginLeft: 4 }}>
                    {studentData.stats.currentStreak}
                  </Text>
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Sequência</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>
                  {studentData.stats.avgPerWeek}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Por Semana</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Meu Personal */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Meu Personal
            </Text>
            <LiquidGlassCard>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Image
                  source={studentData.personalTrainer.image}
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 28,
                    marginRight: 16,
                    borderWidth: 2,
                    borderColor: '#60A5FA'
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>
                    {studentData.personalTrainer.name}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                    CREF: {studentData.personalTrainer.cref}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
              </TouchableOpacity>
            </LiquidGlassCard>
          </View>

          {/* Objetivos */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Meus Objetivos
            </Text>
            {studentData.goals.map((goal) => (
              <LiquidGlassCard key={goal.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: 'rgba(59, 130, 246, 0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Ionicons name={goal.icon as any} size={20} color="#60A5FA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 2 }}>
                      {goal.name}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                      {goal.progress}% concluído
                    </Text>
                  </View>
                </View>
                {/* Barra de Progresso */}
                <View style={{
                  height: 8,
                  backgroundColor: 'rgba(156, 163, 175, 0.2)',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <View style={{
                    height: '100%',
                    width: `${goal.progress}%`,
                    backgroundColor: '#60A5FA',
                    borderRadius: 4
                  }} />
                </View>
              </LiquidGlassCard>
            ))}
          </View>

          {/* Evolução de Medidas */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Evolução de Medidas
            </Text>
            
            {/* Peso */}
            <LiquidGlassCard style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Peso</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="arrow-down" size={16} color="#22C55E" />
                  <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                    -{(studentData.measurements.weight.initial - studentData.measurements.weight.current).toFixed(1)} kg
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                    {studentData.measurements.weight.current} kg
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Atual</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600' }}>
                    Meta: {studentData.measurements.weight.goal} kg
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                    Inicial: {studentData.measurements.weight.initial} kg
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>

            {/* Gordura Corporal */}
            <LiquidGlassCard style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Gordura Corporal</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="arrow-down" size={16} color="#22C55E" />
                  <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                    -{(studentData.measurements.bodyFat.initial - studentData.measurements.bodyFat.current).toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                    {studentData.measurements.bodyFat.current}%
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Atual</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600' }}>
                    Meta: {studentData.measurements.bodyFat.goal}%
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                    Inicial: {studentData.measurements.bodyFat.initial}%
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>

            {/* Massa Muscular */}
            <LiquidGlassCard>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Massa Muscular</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="arrow-up" size={16} color="#22C55E" />
                  <Text style={{ color: '#22C55E', fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                    +{(studentData.measurements.muscle.current - studentData.measurements.muscle.initial).toFixed(1)} kg
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                    {studentData.measurements.muscle.current} kg
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Atual</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600' }}>
                    Meta: {studentData.measurements.muscle.goal} kg
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                    Inicial: {studentData.measurements.muscle.initial} kg
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>
          </View>

          {/* Configurações */}
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
                    <Ionicons name="person-outline" size={20} color="#60A5FA" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                    Editar Perfil
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
              </TouchableOpacity>
            </LiquidGlassCard>

            {/* Plano e Pagamento */}
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
                  <View>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                      Plano e Pagamento
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                      Próximo: {studentData.nextPayment}
                    </Text>
                  </View>
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
                    <Ionicons name="notifications-outline" size={20} color="#60A5FA" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                    Notificações
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
              </TouchableOpacity>
            </LiquidGlassCard>

            {/* Ajuda e Suporte */}
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
                    <Ionicons name="help-circle-outline" size={20} color="#60A5FA" />
                  </View>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                    Ajuda e Suporte
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
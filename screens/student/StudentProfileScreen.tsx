import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { RefreshSplash } from '../../components/RefreshSplash';
import LiquidGlassCard from '../../components/LiquidGlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { clientePhotosService, treinadorPhotosService, clientesService, clienteEstatisticService } from '../../services';

const { width: screenWidth } = Dimensions.get('window');

export default function StudentProfileScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [trainerImageUri, setTrainerImageUri] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loadingStudentData, setLoadingStudentData] = useState(true);
  const [latestStats, setLatestStats] = useState<any>(null);
  const [allStats, setAllStats] = useState<any[]>([]);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const { user, signOut } = useAuth();

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('../../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega dados do aluno
  useEffect(() => {
    if (user?.id) {
      loadStudentData();
      loadProfilePhoto();
      loadTrainerPhoto();
      loadStudentStats();
    }
  }, [user?.id]);

  const loadStudentData = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingStudentData(true);
      const data = await clientesService.getById(user.id);
      setStudentData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
      // Dados de fallback
      setStudentData({
        name: user?.name || 'Aluno',
        email: user?.email || '',
        memberSince: 'Março 2024',
        plan: 'Premium Mensal',
        stats: {
          workoutsCompleted: 0,
          currentStreak: 0,
          totalDays: 0,
          avgPerWeek: 0,
        },
        goals: [],
        measurements: {
          weight: { current: 0, initial: 0, goal: 0 },
          bodyFat: { current: 0, initial: 0, goal: 0 },
          muscle: { current: 0, initial: 0, goal: 0 },
        },
        personalTrainer: {
          name: 'Personal Trainer',
          cref: 'N/A',
        }
      });
    } finally {
      setLoadingStudentData(false);
    }
  };

  const loadStudentStats = async () => {
    if (!user?.id) return;
    
    try {
      // Busca última estatística
      const latest = await clienteEstatisticService.getLatest(user.id);
      setLatestStats(latest);
      
      // Busca todas estatísticas para calcular progresso
      const all = await clienteEstatisticService.getAll({ cliente_id: user.id });
      setAllStats(all);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do aluno:', error);
      setLatestStats(null);
      setAllStats([]);
    }
  };

  const getMeasurementData = () => {
    if (!allStats || allStats.length === 0) {
      return {
        weight: { current: 0, initial: 0, goal: 0 },
        bodyFat: { current: 0, initial: 0, goal: 0 },
        muscle: { current: 0, initial: 0, goal: 0 },
      };
    }

    const sortedStats = [...allStats].sort((a, b) => 
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    const initial = sortedStats[0];
    const current = latestStats || sortedStats[sortedStats.length - 1];

    return {
      weight: {
        current: parseFloat(current.weight || '0'),
        initial: parseFloat(initial.weight || '0'),
        goal: 75, // Meta exemplo - pode vir de outra fonte
      },
      bodyFat: {
        current: parseFloat(current.muscle_mass_percentage || '0'),
        initial: parseFloat(initial.muscle_mass_percentage || '0'),
        goal: 15, // Meta exemplo
      },
      muscle: {
        current: parseFloat(current.weight || '0') * (parseFloat(current.muscle_mass_percentage || '0') / 100),
        initial: parseFloat(initial.weight || '0') * (parseFloat(initial.muscle_mass_percentage || '0') / 100),
        goal: 25, // Meta exemplo
      },
    };
  };

  const loadProfilePhoto = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingPhoto(true);
      const photoUrl = clientePhotosService.getProfilePhotoUrl(user.id);
      setProfileImageUri(photoUrl);
    } catch (error) {
      console.log('Nenhuma foto de perfil encontrada');
      setProfileImageUri(null);
    } finally {
      setLoadingPhoto(false);
    }
  };

  const loadTrainerPhoto = async () => {
    // Por enquanto, vamos usar um ID fixo do treinador (você pode ajustar conforme sua lógica)
    // Em um cenário real, você obteria o treinador_id do perfil do cliente
    const treinadorId = user?.treinador_id || 1; // Assumindo que existe um campo treinador_id no user
    
    try {
      const photoUrl = treinadorPhotosService.getProfilePhotoUrl(treinadorId);
      setTrainerImageUri(photoUrl);
    } catch (error) {
      console.log('Nenhuma foto de perfil encontrada para o personal trainer');
      setTrainerImageUri(null);
    }
  };

  const handleSelectImage = async () => {
    try {
      // Solicita permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de permissão para acessar suas fotos.'
        );
        return;
      }

      // Abre o seletor de imagens
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await handleUploadPhoto(asset.uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleUploadPhoto = async (uri: string) => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Cria FormData compatível com React Native Web
      const formData = new FormData();
      
      // Para React Native Web, precisamos converter a URI em Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Append do arquivo como blob
      formData.append('photo', blob, 'profile.jpg');

      // Faz upload da foto usando o serviço diretamente
      await clientePhotosService.uploadProfilePhoto(user.id, formData);
      
      // Atualiza a imagem na tela
      setProfileImageUri(uri);
      
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar a foto de perfil.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setShowRefreshSplash(true);
    
    // Recarrega dados reais
    await Promise.all([
      loadStudentData(),
      loadProfilePhoto(),
      loadTrainerPhoto(),
      loadStudentStats()
    ]);
    
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
              {loadingPhoto ? (
                <View style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: 'rgba(96, 165, 250, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: '#60A5FA'
                }}>
                  <ActivityIndicator size="large" color="#60A5FA" />
                </View>
              ) : (
                <Image
                  source={profileImageUri ? { uri: profileImageUri } : require('../../assets/images/personal.jpeg')}
                  style={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: 60,
                    borderWidth: 4,
                    borderColor: '#60A5FA'
                  }}
                />
              )}
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
                onPress={handleSelectImage}
                disabled={uploadingPhoto || loadingPhoto}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator size={16} color="white" />
                ) : (
                  <Ionicons name="camera" size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            {/* Nome */}
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
              {studentData?.name || user?.name || 'Carregando...'}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
              Membro desde {studentData?.memberSince || 'Não informado'}
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
                {studentData?.plan || 'Plano não informado'}
              </Text>
            </View>
          </View>

          {/* Estatísticas de Treino */}
          <LiquidGlassCard style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>
                  {studentData?.stats?.workoutsCompleted || '0'}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Treinos</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="flame" size={24} color="#F59E0B" />
                  <Text style={{ color: '#F59E0B', fontSize: 28, fontWeight: 'bold', marginLeft: 4 }}>
                    {studentData?.stats?.currentStreak || '0'}
                  </Text>
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Sequência</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>
                  {studentData?.stats?.avgPerWeek || '0'}
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
                  source={trainerImageUri ? { uri: trainerImageUri } : require('../../assets/images/personal.jpeg')}
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
                    {studentData?.personalTrainer?.name || 'Personal Trainer'}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                    CREF: {studentData?.personalTrainer?.cref || 'Não informado'}
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
            {(studentData?.goals || []).map((goal: any) => (
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
            
            {(() => {
              const measurements = getMeasurementData();
              const weightDiff = measurements.weight.initial - measurements.weight.current;
              const bodyFatDiff = measurements.bodyFat.initial - measurements.bodyFat.current;
              const muscleDiff = measurements.muscle.current - measurements.muscle.initial;

              return (
                <>
                  {/* Peso */}
                  <LiquidGlassCard style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Peso</Text>
                      {weightDiff !== 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name={weightDiff > 0 ? "arrow-down" : "arrow-up"} size={16} color={weightDiff > 0 ? "#22C55E" : "#EF4444"} />
                          <Text style={{ color: weightDiff > 0 ? "#22C55E" : "#EF4444", fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                            {weightDiff > 0 ? '-' : '+'}{Math.abs(weightDiff).toFixed(1)} kg
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                          {measurements.weight.current.toFixed(1)} kg
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Atual</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600' }}>
                          Meta: {measurements.weight.goal.toFixed(1)} kg
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                          Inicial: {measurements.weight.initial.toFixed(1)} kg
                        </Text>
                      </View>
                    </View>
                  </LiquidGlassCard>

                  {/* Gordura Corporal */}
                  <LiquidGlassCard style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>% Gordura</Text>
                      {bodyFatDiff !== 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name={bodyFatDiff > 0 ? "arrow-down" : "arrow-up"} size={16} color={bodyFatDiff > 0 ? "#22C55E" : "#EF4444"} />
                          <Text style={{ color: bodyFatDiff > 0 ? "#22C55E" : "#EF4444", fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                            {bodyFatDiff > 0 ? '-' : '+'}{Math.abs(bodyFatDiff).toFixed(1)}%
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                          {measurements.bodyFat.current.toFixed(1)}%
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Atual</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600' }}>
                          Meta: {measurements.bodyFat.goal.toFixed(1)}%
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                          Inicial: {measurements.bodyFat.initial.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </LiquidGlassCard>

                  {/* Massa Muscular */}
                  <LiquidGlassCard>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Massa Muscular</Text>
                      {muscleDiff !== 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name={muscleDiff > 0 ? "arrow-up" : "arrow-down"} size={16} color={muscleDiff > 0 ? "#22C55E" : "#EF4444"} />
                          <Text style={{ color: muscleDiff > 0 ? "#22C55E" : "#EF4444", fontSize: 14, fontWeight: '600', marginLeft: 4 }}>
                            {muscleDiff > 0 ? '+' : '-'}{Math.abs(muscleDiff).toFixed(1)} kg
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View>
                        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                          {measurements.muscle.current.toFixed(1)} kg
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Atual</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600' }}>
                          Meta: {measurements.muscle.goal.toFixed(1)} kg
                        </Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                          Inicial: {measurements.muscle.initial.toFixed(1)} kg
                        </Text>
                      </View>
                    </View>
                  </LiquidGlassCard>
                </>
              );
            })()}
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
                      Próximo: {studentData?.nextPayment || 'Não informado'}
                    </Text>
                  </View>
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
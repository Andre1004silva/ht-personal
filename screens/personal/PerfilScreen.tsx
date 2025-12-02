import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { treinadorPhotosService, treinadoresService } from '@/services';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function PerfilScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [loadingTrainerData, setLoadingTrainerData] = useState(true);
  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(0);
  const { signOut, user, userType } = useAuth();

  // Video player configurado para loop
  const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  // Carrega dados do treinador
  useEffect(() => {
    if (user?.id) {
      loadTrainerData();
      loadProfilePhoto();
    }
  }, [user?.id]);

  const loadProfilePhoto = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingPhoto(true);
      const photoUrl = treinadorPhotosService.getProfilePhotoUrl(user.id);
      setProfileImageUri(photoUrl);
    } catch (error) {
      console.log('Nenhuma foto de perfil encontrada');
      setProfileImageUri(null);
    } finally {
      setLoadingPhoto(false);
    }
  };

  const loadTrainerData = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingTrainerData(true);
      const data = await treinadoresService.getById(user.id);
      setTrainerData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do treinador:', error);
    } finally {
      setLoadingTrainerData(false);
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
      await treinadorPhotosService.uploadProfilePhoto(user.id, formData);
      
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
      loadTrainerData(),
      loadProfilePhoto()
    ]);
    
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
                source={profileImageUri ? { uri: profileImageUri } : require('@/assets/images/personal.jpeg')}
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
          
          {/* Nome e Profissão */}
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
            {trainerData?.name || user?.name || 'Carregando...'}
          </Text>
          <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Personal Trainer
          </Text>
          {trainerData?.cref && (
            <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
              CREF: {trainerData.cref}
            </Text>
          )}
        </View>

        {/* Estatísticas */}
        <LiquidGlassCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{trainerData?.total_clientes || '0'}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Alunos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{trainerData?.anos_experiencia || '0'}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Anos</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(156, 163, 175, 0.3)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{trainerData?.avaliacao_media || '5.0'}</Text>
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
              {trainerData?.bio || 'Especialista em transformação corporal com foco em resultados sustentáveis e saúde integral.'}
            </Text>
          </LiquidGlassCard>
        </View>

        {/* Especialidades */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Especialidades
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {trainerData?.especialidades ? trainerData.especialidades.split(',').map((specialty: string, index: number) => (
              <View 
                key={index}
                style={{ 
                  backgroundColor: '#1E3A8A', 
                  paddingHorizontal: 16, 
                  paddingVertical: 10, 
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#60A5FA'
                }}
              >
                <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>{specialty.trim()}</Text>
              </View>
            )) : (
              ['Hipertrofia', 'Emagrecimento', 'Funcional'].map((specialty, index) => (
                <View 
                  key={index}
                  style={{ 
                    backgroundColor: '#1E3A8A', 
                    paddingHorizontal: 16, 
                    paddingVertical: 10, 
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#60A5FA'
                  }}
                >
                  <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>{specialty}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Certificações */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Formação e Certificações
          </Text>
          {trainerData?.formacao ? (
            <LiquidGlassCard style={{ marginBottom: 12 }}>
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
                    {trainerData.formacao}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                    Formação Acadêmica
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard style={{ marginBottom: 12 }}>
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
                    Educação Física - Bacharelado
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                    Formação Acadêmica
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>
          )}
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
                  {trainerData?.local_trabalho || 'Academia'}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {trainerData?.endereco || 'Endereço não informado'}
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
                  {trainerData?.horario_funcionamento || '06:00 - 22:00'}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(156, 163, 175, 0.2)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Sábado</Text>
                <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>
                  {trainerData?.horario_sabado || '08:00 - 14:00'}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(156, 163, 175, 0.2)' }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Domingo</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '600' }}>
                  {trainerData?.horario_domingo || 'Fechado'}
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
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{trainerData?.telefone || user?.phone_number || 'Não informado'}</Text>
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
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{trainerData?.instagram || 'Não informado'}</Text>
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
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{trainerData?.email || user?.email || 'Não informado'}</Text>
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

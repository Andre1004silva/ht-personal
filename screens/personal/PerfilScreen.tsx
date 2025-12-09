import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
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
import trainerSchedulesService, { TrainerScheduleSlot } from '@/services/trainerSchedulesService';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function PerfilScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showRefreshSplash, setShowRefreshSplash] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [loadingTrainerData, setLoadingTrainerData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [especialidades, setEspecialidades] = useState('');
  const [formacao, setFormacao] = useState('');
  const [schedules, setSchedules] = useState<TrainerScheduleSlot[]>([]);
  const [newSchedule, setNewSchedule] = useState<Record<number, { start: string; end: string }>>({
    1: { start: '', end: '' },
    2: { start: '', end: '' },
    3: { start: '', end: '' },
    4: { start: '', end: '' },
    5: { start: '', end: '' },
    6: { start: '', end: '' },
    7: { start: '', end: '' },
  });
  const [instagram, setInstagram] = useState('');
  const [experienciaAnos, setExperienciaAnos] = useState('');

  const formatTimeInput = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let hh = digits.slice(0, 2);
    let mm: string;
    if (digits.length <= 2) {
      mm = '00';
    } else if (digits.length === 3) {
      mm = digits.slice(2, 3) + '0';
    } else {
      mm = digits.slice(2, 4);
    }
    const hNum = Math.min(parseInt(hh || '0', 10), 23);
    const mNum = Math.min(parseInt(mm || '0', 10), 59);
    return `${String(hNum).padStart(2, '0')}:${String(mNum).padStart(2, '0')}`;
  };
  const [timePicker, setTimePicker] = useState<{ visible: boolean; day: number; field: 'start' | 'end'; unit: 'hour' | 'minute' }>({ visible: false, day: 1, field: 'start', unit: 'hour' });
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
  const getHH = (s: string) => (s?.split(':')[0] || '').padStart(2, '0');
  const getMM = (s: string) => (s?.split(':')[1] || '00').padStart(2, '0');
  const setPart = (day: number, field: 'start'|'end', unit: 'hour'|'minute', value: number) => {
    const curr = newSchedule[day][field] || '00:00';
    const hh = unit === 'hour' ? String(value).padStart(2, '0') : getHH(curr);
    const mm = unit === 'minute' ? String(value).padStart(2, '0') : getMM(curr);
    setNewSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: `${hh}:${mm}` } }));
  };
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
      setBio(data?.bio || '');
      setEspecialidades(data?.especialidades || '');
      setFormacao(data?.formacao || '');
      setInstagram(data?.instagram || '');
      setExperienciaAnos((data?.experiencia_anos ?? '')?.toString());
      try {
        const sched = await trainerSchedulesService.list(user.id);
        setSchedules(sched);
      } catch {}
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
            {trainerData?.nome || user?.name || 'Carregando...'}
          </Text>
          <Text style={{ color: '#60A5FA', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Personal Trainer
          </Text>
          {trainerData?.cref && (
            <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
              CREF: {trainerData.cref}
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            {!editing && (
              <TouchableOpacity
                style={{ backgroundColor: '#60A5FA', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 }}
                onPress={() => setEditing(true)}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Editar Perfil</Text>
              </TouchableOpacity>
            )}
          </View>
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
              {editing ? (
                <TextInput
                  value={experienciaAnos}
                  onChangeText={setExperienciaAnos}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#93C5FD"
                  style={{ color: '#60A5FA', fontSize: 24, fontWeight: 'bold', minWidth: 60, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(96,165,250,0.4)' }}
                />
              ) : (
                <Text style={{ color: '#60A5FA', fontSize: 28, fontWeight: 'bold' }}>{trainerData?.experiencia_anos ?? '0'}</Text>
              )}
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
            {editing ? (
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20, borderWidth: 1, borderColor: 'rgba(96,165,250,0.3)', borderRadius: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.06)' }}
                placeholder="Descreva seu perfil"
                placeholderTextColor="#6B7280"
              />
            ) : (
              <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 20 }}>
                {trainerData?.bio || 'Especialista em transformação corporal com foco em resultados sustentáveis e saúde integral.'}
              </Text>
            )}
          </LiquidGlassCard>
        </View>

        {/* Especialidades */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Especialidades
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {editing ? (
              <TextInput
                value={especialidades}
                onChangeText={setEspecialidades}
                style={{ color: '#D1D5DB', borderWidth: 1, borderColor: 'rgba(96,165,250,0.3)', borderRadius: 12, padding: 12, flex: 1, backgroundColor: 'rgba(255,255,255,0.06)' }}
                placeholder="Separe por vírgulas"
                placeholderTextColor="#6B7280"
              />
            ) : (
              (trainerData?.especialidades ? trainerData.especialidades.split(',') : ['Hipertrofia', 'Emagrecimento', 'Funcional']).map((specialty: string, index: number) => (
                <View key={index} style={{ backgroundColor: '#1E3A8A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#60A5FA' }}>
                  <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>{(specialty || '').trim()}</Text>
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
          <LiquidGlassCard style={{ marginBottom: 12 }}>
            {editing ? (
              <TextInput
                value={formacao}
                onChangeText={setFormacao}
                multiline
                style={{ color: 'white', fontSize: 15, fontWeight: '600', borderWidth: 1, borderColor: 'rgba(96,165,250,0.3)', borderRadius: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.06)' }}
                placeholder="Ex.: Educação Física - Bacharelado; Certificação ABC..."
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="school-outline" size={20} color="#60A5FA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginBottom: 2 }}>
                    {trainerData?.formacao || 'Educação Física - Bacharelado'}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                    Formação Acadêmica
                  </Text>
                </View>
              </View>
            )}
          </LiquidGlassCard>
        </View>
        
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Horários de Atendimento
          </Text>
          <LiquidGlassCard>
            <View style={{ gap: 16 }}>
              {[
                { label: 'Segunda', value: 1 },
                { label: 'Terça', value: 2 },
                { label: 'Quarta', value: 3 },
                { label: 'Quinta', value: 4 },
                { label: 'Sexta', value: 5 },
                { label: 'Sábado', value: 6 },
                { label: 'Domingo', value: 7 },
              ].map((d) => (
                <View key={d.value}>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 6 }}>{d.label}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 8 }}>
                      {schedules.filter(s => s.day_of_week === d.value).map((s, idx) => (
                        <View key={`${d.value}-${s.start_time}-${s.end_time}-${idx}`} style={{ backgroundColor: 'rgba(96,165,250,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#60A5FA', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ color: '#60A5FA', fontSize: 14, fontWeight: '600' }}>{(s.start_time || '').slice(0,5)} - {(s.end_time || '').slice(0,5)}</Text>
                          {editing && (
                            <TouchableOpacity onPress={() => {
                              setSchedules(prev => prev.filter(x => !(x.day_of_week === d.value && x.start_time === s.start_time && x.end_time === s.end_time)));
                            }}>
                              <Ionicons name="close" size={16} color="#93C5FD" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                  {editing && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={{ flex: 1, minWidth: 0, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.35)' }}
                          onPress={() => setTimePicker({ visible: true, day: d.value, field: 'start', unit: 'hour' })}
                        >
                          <Text style={{ color: 'white', fontSize: 16 }}>{getHH(newSchedule[d.value].start || '')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ width: 56, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.35)', alignItems: 'center' }}
                          onPress={() => setTimePicker({ visible: true, day: d.value, field: 'start', unit: 'minute' })}
                        >
                          <Text style={{ color: 'white', fontSize: 16 }}>{getMM(newSchedule[d.value].start || '')}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>até</Text>
                      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={{ flex: 1, minWidth: 0, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.35)' }}
                          onPress={() => setTimePicker({ visible: true, day: d.value, field: 'end', unit: 'hour' })}
                        >
                          <Text style={{ color: 'white', fontSize: 16 }}>{getHH(newSchedule[d.value].end || '')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ width: 56, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.35)', alignItems: 'center' }}
                          onPress={() => setTimePicker({ visible: true, day: d.value, field: 'end', unit: 'minute' })}
                        >
                          <Text style={{ color: 'white', fontSize: 16 }}>{getMM(newSchedule[d.value].end || '')}</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#60A5FA', alignItems: 'center', justifyContent: 'center' }}
                        onPress={() => {
                          const toHHMM = (s: string) => {
                            const digits = s.replace(/\D/g, '');
                            const h = digits.slice(0, 2).padEnd(2, '0');
                            const m = digits.slice(2, 4).padEnd(2, '0');
                            return `${h}:${m}`;
                          };
                          const st = toHHMM(newSchedule[d.value].start.trim());
                          const en = toHHMM(newSchedule[d.value].end.trim());
                          if (!st || !en || st.length < 4 || en.length < 4) return;
                          setSchedules(prev => ([...prev, { trainer_id: user?.id as number, day_of_week: d.value, start_time: st, end_time: en }]));
                          setNewSchedule(prev => ({ ...prev, [d.value]: { start: '', end: '' } }));
                        }}
                      >
                        <Ionicons name="add" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={{ height: 1, backgroundColor: 'rgba(156, 163, 175, 0.2)', marginTop: 12 }} />
                </View>
              ))}
              {editing && (
                <TouchableOpacity
                  style={{ backgroundColor: '#60A5FA', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' }}
                  onPress={async () => {
                    if (!user?.id) return;
                    try {
                      const payload = schedules.map(s => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));
                      const saved = await trainerSchedulesService.replaceAll(user.id, payload);
                      setSchedules(saved);
                      Alert.alert('Sucesso', 'Horários atualizados com sucesso');
                      setEditing(false);
                    } catch (e: any) {
                      Alert.alert('Erro', e?.response?.data?.message || 'Não foi possível atualizar horários');
                    }
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Salvar Horários</Text>
                </TouchableOpacity>
              )}
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
                  {editing ? (
                    <TextInput
                      value={instagram}
                      onChangeText={setInstagram}
                      placeholder="@seuusuario"
                      placeholderTextColor="#9CA3AF"
                      style={{ color: '#9CA3AF', fontSize: 13 }}
                    />
                  ) : (
                    <Text style={{ color: '#9CA3AF', fontSize: 13 }}>{trainerData?.instagram || 'Não informado'}</Text>
                  )}
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

        {editing && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#60A5FA', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, flex: 1, alignItems: 'center' }}
              onPress={async () => {
                if (!user?.id) return;
                try {
                  const payload: any = {
                    bio,
                    especialidades,
                    formacao,
                  };
                  if (experienciaAnos !== '') payload.experiencia_anos = Number(experienciaAnos);
                  const updated = await treinadoresService.update(user.id, payload);
                  setTrainerData(updated);
                  Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
                  setEditing(false);
                } catch (e: any) {
                  Alert.alert('Erro', e?.response?.data?.message || 'Não foi possível atualizar o perfil');
                }
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Salvar Alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#141c30', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, flex: 1, alignItems: 'center' }}
              onPress={() => {
                setEditing(false);
                setBio(trainerData?.bio || '');
                setEspecialidades(trainerData?.especialidades || '');
                setFormacao(trainerData?.formacao || '');
                setInstagram(trainerData?.instagram || '');
                setExperienciaAnos((trainerData?.experiencia_anos ?? '')?.toString());
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
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
  <Modal visible={timePicker.visible} transparent animationType="fade">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
      <LiquidGlassCard>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>{timePicker.unit === 'hour' ? 'Selecione Hora' : 'Selecione Minutos'}</Text>
            <TouchableOpacity onPress={() => setTimePicker(prev => ({ ...prev, visible: false }))}>
              <Ionicons name="close" size={22} color="#93C5FD" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(timePicker.unit === 'hour' ? HOURS : MINUTES).map(v => (
              <TouchableOpacity
                key={`opt-${timePicker.unit}-${v}`}
                style={{ backgroundColor: 'rgba(96,165,250,0.15)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#60A5FA' }}
                onPress={() => {
                  setPart(timePicker.day, timePicker.field, timePicker.unit, v);
                  setTimePicker(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: 'white', fontSize: 16 }}>{String(v).padStart(2, '0')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LiquidGlassCard>
    </View>
  </Modal>
  </View>
  );
}

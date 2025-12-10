import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { trainingRoutinesService, TrainingRoutine } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function TreinosScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [showRefreshSplash, setShowRefreshSplash] = useState(false);
    const splashScale = useSharedValue(1);
    const splashOpacity = useSharedValue(0);
    const [activeCategory, setActiveCategory] = useState<'workouts' | 'fitness' | 'plans' | 'training'>('workouts');
    const [rotinas, setRotinas] = useState<TrainingRoutine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Video player configurado para loop
    const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
        player.loop = true;
        player.play();
        player.muted = true;
    });

    // Imagem padrão para treinos sem imagem
    const defaultImage = require('@/assets/images/desenvolvimento.jpeg');

    // Carrega as rotinas da API
    const loadRotinas = async () => {
        try {
            setError(null);
            
            // Verifica se o usuário está logado
            if (!user?.id) {
                setError('Usuário não autenticado. Faça login novamente.');
                setLoading(false);
                return;
            }
            
            // Usa o ID do usuário logado (treinador) como trainer_id
            const data = await trainingRoutinesService.getAll(undefined, user.id);
            setRotinas(data);
        } catch (err) {
            console.error('Erro ao carregar rotinas:', err);
            setError('Erro ao carregar rotinas. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    // Carrega os dados ao montar o componente e quando o user estiver disponível
    useEffect(() => {
        if (user) {
            loadRotinas();
        }
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        setShowRefreshSplash(true);
        await loadRotinas();
        setShowRefreshSplash(false);
        await new Promise(resolve => setTimeout(resolve, 300));
        setRefreshing(false);
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
            
            {/* Category Tabs */}
            <View className="flex-row px-4 gap-2" style={{ paddingTop: 140 }}>
                <TouchableOpacity
                    onPress={() => setActiveCategory('workouts')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'workouts' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Rotinas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('fitness')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'fitness' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Condicionamento
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('plans')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'plans' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Planos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('training')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'training' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Treinamento
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Action Bar */}
            <View className="flex-row items-center justify-between px-4 py-4">
                <TouchableOpacity className="flex-row items-center gap-2 bg-[#141c30] px-4 py-2 rounded-lg">
                    <Ionicons name="filter" size={20} color="#60A5FA" />
                    <Text className="text-white font-medium">Filtros</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2 bg-[#141c30] px-4 py-2 rounded-lg">
                    <Ionicons name="swap-vertical" size={20} color="#60A5FA" />
                    <Text className="text-white font-medium">Ordenar</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2 bg-[#141c30] px-4 py-2 rounded-lg">
                    <Ionicons name="search" size={20} color="#60A5FA" />
                    <Text className="text-white font-medium">Buscar</Text>
                </TouchableOpacity>
            </View>

            {/* Add New Button */}
            <View className="px-4 py-4">
                <LiquidGlassCard>
                    <TouchableOpacity 
                        className="flex-row items-center justify-center gap-2"
                        onPress={() => router.push('/routine-form' as any)}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#60A5FA" />
                        <Text className="text-white font-bold text-base">Criar Nova Rotina</Text>
                    </TouchableOpacity>
                </LiquidGlassCard>
            </View>

            {/* Rotinas Grid */}
            <ScrollView 
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 100 }}
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
                {/* Loading State */}
                {loading && (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#60A5FA" />
                        <Text className="text-white mt-4">Carregando rotinas...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && !loading && (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                        <Text className="text-white mt-4 text-center px-8">{error}</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
                            onPress={loadRotinas}
                        >
                            <Text className="text-white font-semibold">Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!loading && !error && rotinas.length === 0 && (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="barbell-outline" size={64} color="#9CA3AF" />
                        <Text className="text-white mt-4 text-center px-8">
                            Nenhuma rotina encontrada
                        </Text>
                    </View>
                )}

                <View className="flex-row flex-wrap justify-between pb-6">
                    {!loading && !error && rotinas.map((rotina) => (
                        <TouchableOpacity 
                            key={rotina.id} 
                            className="w-[48%] mb-6"
                            onPress={() => router.push(`/routine-details?id=${rotina.id}`)}
                            activeOpacity={0.9}
                        >
                            {/* Card principal */}
                            <View className="rounded-2xl overflow-hidden relative shadow-lg">
                                {/* Imagem de fundo */}
                                <Image
                                    source={defaultImage}
                                    className="w-full h-60"
                                    resizeMode="cover"
                                />

                                {/* Badge de dificuldade */}
                                <View className="absolute top-3 left-3 bg-[#60A5FA] px-3 py-1 rounded-full">
                                    <Text className="text-white text-xs font-semibold">
                                        {rotina.difficulty}
                                    </Text>
                                </View>

                                {/* Ícone Salvar */}
                                <TouchableOpacity className="absolute top-3 right-3 bg-black/40 w-8 h-8 rounded-lg items-center justify-center">
                                    <Ionicons name="bookmark" size={16} color="#60A5FA" />
                                </TouchableOpacity>

                                {/* Camada preta translúcida cobrindo metade inferior */}
                                <View
                                    className="absolute bottom-0 left-0 right-0 px-3 py-2 justify-between"
                                    style={{
                                        height: "50%",
                                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                                    }}
                                >
                                    {/* Título e dados */}
                                    <View>
                                        <Text
                                            className="text-white font-semibold text-sm mb-1"
                                            numberOfLines={1}
                                        >
                                            {rotina.student_name}
                                        </Text>
                                        <Text
                                            className="text-gray-300 text-xs mb-2"
                                            numberOfLines={1}
                                        >
                                            {rotina.goal}
                                        </Text>

                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="calendar" size={13} color="#ddd" />
                                                <Text className="text-gray-300 text-xs font-medium">
                                                    {new Date(rotina.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="fitness" size={13} color="#60A5FA" />
                                                <Text className="text-gray-300 text-xs">
                                                    {rotina.routine_type === 'Dia da semana' ? 'Semanal' : 'Numérico'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
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

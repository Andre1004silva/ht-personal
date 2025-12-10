import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { trainingsService, Training } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function TreinosScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [showRefreshSplash, setShowRefreshSplash] = useState(false);
    const splashScale = useSharedValue(1);
    const splashOpacity = useSharedValue(0);
    const [activeCategory, setActiveCategory] = useState<'all' | 'chest' | 'back' | 'legs' | 'arms'>('all');
    const [treinos, setTreinos] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Video player configurado para loop
    const videoPlayer = useVideoPlayer(require('@/assets/background_720p.mp4'), player => {
        player.loop = true;
        player.play();
        player.muted = true;
    });

    // Imagem padrão para treinos sem imagem
    const defaultImage = require('@/assets/images/desenvolvimento.jpeg');

    // Carrega os treinos da API
    const loadTreinos = async () => {
        try {
            setError(null);
            
            // Verifica se o usuário está logado
            if (!user?.id) {
                setError('Usuário não autenticado. Faça login novamente.');
                setLoading(false);
                return;
            }
            
            // Carrega todos os treinos do treinador
            const data = await trainingsService.getAll(user.id);
            setTreinos(data);
        } catch (err) {
            console.error('Erro ao carregar treinos:', err);
            setError('Erro ao carregar treinos. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    // Carrega os dados ao montar o componente e quando o user estiver disponível
    useEffect(() => {
        if (user) {
            loadTreinos();
        }
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        setShowRefreshSplash(true);
        await loadTreinos();
        setShowRefreshSplash(false);
        await new Promise(resolve => setTimeout(resolve, 300));
        setRefreshing(false);
    };

    // Filtra treinos baseado na busca
    const treinosFiltrados = treinos.filter(treino => 
        treino.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treino.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );


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
                    onPress={() => setActiveCategory('all')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'all' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Todos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('chest')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'chest' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Peito
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('back')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'back' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Costas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('legs')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'legs' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Pernas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('arms')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'arms' ? 'bg-[#60A5FA]' : 'bg-[#141c30]'}`}
                >
                    <Text className="font-semibold text-white">
                        Braços
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-4">
                <View className="flex-row items-center bg-[#141c30] px-4 py-3 rounded-xl">
                    <Ionicons name="search" size={20} color="#60A5FA" />
                    <TextInput
                        className="flex-1 text-white text-base ml-2"
                        placeholder="Buscar treinos..."
                        placeholderTextColor="#6B7280"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Info Banner */}
            <View className="px-4 pb-2">
                <LiquidGlassCard>
                    <View className="flex-row items-center gap-3">
                        <Ionicons name="library-outline" size={24} color="#60A5FA" />
                        <View className="flex-1">
                            <Text className="text-white font-bold text-base">Biblioteca de Treinos</Text>
                            <Text className="text-gray-400 text-sm">Explore e gerencie seus treinos</Text>
                        </View>
                    </View>
                </LiquidGlassCard>
            </View>

            {/* Treinos Grid */}
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
                        <Text className="text-white mt-4">Carregando treinos...</Text>
                    </View>
                )}

                {/* Error State */}
                {error && !loading && (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                        <Text className="text-white mt-4 text-center px-8">{error}</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-[#60A5FA] px-6 py-3 rounded-lg"
                            onPress={loadTreinos}
                        >
                            <Text className="text-white font-semibold">Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Empty State */}
                {!loading && !error && treinosFiltrados.length === 0 && (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="barbell-outline" size={64} color="#9CA3AF" />
                        <Text className="text-white mt-4 text-center px-8">
                            {searchTerm ? 'Nenhum treino encontrado' : 'Nenhum treino cadastrado'}
                        </Text>
                    </View>
                )}

                {/* Treinos List */}
                <View className="pb-6">
                    {!loading && !error && treinosFiltrados.map((treino) => (
                        <LiquidGlassCard key={treino.id} style={{ marginBottom: 16 }}>
                            <TouchableOpacity 
                                className="flex-row items-center"
                                activeOpacity={0.7}
                            >
                                {/* Ícone do treino */}
                                <View className="mr-4">
                                    <View className="bg-[#60A5FA] w-14 h-14 rounded-2xl items-center justify-center">
                                        <Ionicons name="barbell" size={28} color="white" />
                                    </View>
                                </View>

                                {/* Informações do treino */}
                                <View className="flex-1">
                                    <Text className="text-white text-lg font-bold mb-1">{treino.name}</Text>
                                    {treino.notes && (
                                        <Text className="text-gray-300 text-sm mb-1" numberOfLines={2}>
                                            {treino.notes}
                                        </Text>
                                    )}
                                    {treino.day_of_week && (
                                        <View className="flex-row items-center gap-2 mt-1">
                                            <Ionicons name="calendar-outline" size={14} color="#60A5FA" />
                                            <Text className="text-[#60A5FA] text-sm font-semibold">
                                                {treino.day_of_week}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Seta */}
                                <Ionicons name="chevron-forward" size={24} color="#60A5FA" />
                            </TouchableOpacity>
                        </LiquidGlassCard>
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

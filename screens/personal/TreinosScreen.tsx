import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { RefreshSplash } from '@/components/RefreshSplash';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { trainingsService, exerciseTrainingsService, exercisesService, Training, ExerciseTraining, Exercise } from '@/services';
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
    const [exercisesByTraining, setExercisesByTraining] = useState<Record<number, ExerciseTraining[]>>({});
    const [openTrainings, setOpenTrainings] = useState<number[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTrainingName, setNewTrainingName] = useState('');
    const [newTrainingNotes, setNewTrainingNotes] = useState('');
    const [newTrainingDayOfWeek, setNewTrainingDayOfWeek] = useState('');
    const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
    const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
    const [exercisesLoading, setExercisesLoading] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [targetTrainingId, setTargetTrainingId] = useState<number | null>(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
    const [repType, setRepType] = useState<'reps-load' | 'reps-load-time' | 'complete-set' | 'reps-time' | ''>('');
    const [defaultLoad, setDefaultLoad] = useState<string>('');
    const [defaultSet, setDefaultSet] = useState<string>('');
    const [defaultReps, setDefaultReps] = useState<string>('');
    const [defaultTime, setDefaultTime] = useState<string>('');
    const [defaultRest, setDefaultRest] = useState<string>('');
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
            
            const data = await trainingsService.getLibrary(user.id);
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

    const toggleExercises = async (trainingId: number) => {
        const isOpen = openTrainings.includes(trainingId);
        if (isOpen) {
            setOpenTrainings(prev => prev.filter(id => id !== trainingId));
            return;
        }
        if (!exercisesByTraining[trainingId]) {
            try {
                const rows = await exerciseTrainingsService.getByTrainingId(trainingId);
                setExercisesByTraining(prev => ({ ...prev, [trainingId]: rows }));
            } catch (e) {}
        }
        setOpenTrainings(prev => [...prev, trainingId]);
    };

    const openAddExercise = async (trainingId: number) => {
        try {
            setExercisesLoading(true);
            setTargetTrainingId(trainingId);
            const list = await exercisesService.getAll();
            setAvailableExercises(list);
            setSelectedExerciseId(null);
            setRepType('');
            setDefaultLoad('');
            setDefaultSet('');
            setDefaultReps('');
            setDefaultTime('');
            setDefaultRest('');
            setShowAddExerciseModal(true);
        } catch (e) {
            setError('Não foi possível carregar exercícios');
        } finally {
            setExercisesLoading(false);
        }
    };

    const filteredExercises = availableExercises.filter(e =>
        (e.name || '').toLowerCase().includes(exerciseSearchTerm.toLowerCase())
    );

    const handleAddExercise = async () => {
        try {
            if (!targetTrainingId || !selectedExerciseId) {
                setError('Selecione um exercício');
                return;
            }
            const payload: any = {
                training_id: targetTrainingId,
                exercise_id: selectedExerciseId,
            };
            if (repType) payload.rep_type = repType;
            if (defaultLoad) payload.default_load = Number(defaultLoad);
            if (defaultSet) payload.default_set = Number(defaultSet);
            if (defaultReps) payload.default_reps = Number(defaultReps);
            if (defaultTime) payload.default_time = Number(defaultTime);
            if (defaultRest) payload.default_rest = Number(defaultRest);

            await exerciseTrainingsService.create(payload);
            setShowAddExerciseModal(false);
            // refresh exercises list for training
            const rows = await exerciseTrainingsService.getByTrainingId(targetTrainingId);
            setExercisesByTraining(prev => ({ ...prev, [targetTrainingId]: rows }));
            if (!openTrainings.includes(targetTrainingId)) setOpenTrainings(prev => [...prev, targetTrainingId]);
        } catch (e: any) {
            const message = e?.response?.data?.message || 'Não foi possível vincular exercício';
            setError(message);
        }
    };

    const handleCreateTraining = async () => {
        try {
            if (!user?.id) return;
            if (!newTrainingName.trim()) {
                setError('Informe um nome para o treino');
                return;
            }
            const created = await trainingsService.create({
                name: newTrainingName.trim(),
                notes: newTrainingNotes || undefined,
                day_of_week: newTrainingDayOfWeek || undefined,
                trainer_id: user.id,
                is_library: true,
            });
            setShowCreateModal(false);
            setNewTrainingName('');
            setNewTrainingNotes('');
            setNewTrainingDayOfWeek('');
            await loadTreinos();
        } catch (e) {
            setError('Não foi possível criar o treino');
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
                        <TouchableOpacity className="bg-[#60A5FA] px-3 py-2 rounded-lg" onPress={() => setShowCreateModal(true)}>
                            <Text className="text-white font-semibold">Adicionar</Text>
                        </TouchableOpacity>
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
                                onPress={() => toggleExercises(treino.id!)}
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

                                <Ionicons name={openTrainings.includes(treino.id!) ? 'chevron-down' : 'chevron-forward'} size={24} color="#60A5FA" />
                            </TouchableOpacity>
                            {openTrainings.includes(treino.id!) && (
                                <View className="mt-3">
                                    {!exercisesByTraining[treino.id!] ? (
                                        <View className="items-center py-4">
                                            <ActivityIndicator color="#60A5FA" />
                                        </View>
                                    ) : (
                                        exercisesByTraining[treino.id!].length === 0 ? (
                                            <View className="items-center py-4">
                                                <Ionicons name="barbell-outline" size={28} color="#9CA3AF" />
                                                <Text className="text-gray-400 mt-2">Sem exercícios vinculados</Text>
                                                <TouchableOpacity className="mt-3 bg-[#60A5FA] px-3 py-2 rounded-lg" onPress={() => openAddExercise(treino.id!)}>
                                                    <Text className="text-white font-semibold">Adicionar exercício</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            exercisesByTraining[treino.id!].map((ex) => (
                                                <View key={ex.id} className="bg-[#1e2a47] rounded-lg p-3 mb-2">
                                                    <View className="flex-row items-center justify-between">
                                                        <Text className="text-white font-semibold">{ex.exercise_name}</Text>
                                                        <Text className="text-[#60A5FA] text-xs">{ex.rep_type ?? '—'}</Text>
                                                    </View>
                                                    <View className="flex-row justify-between mt-2">
                                                        <Text className="text-gray-300 text-xs">Carga: {ex.default_load ?? '—'}</Text>
                                                        <Text className="text-gray-300 text-xs">Séries: {ex.default_set ?? '—'}</Text>
                                                        <Text className="text-gray-300 text-xs">Reps: {ex.default_reps ?? '—'}</Text>
                                                    </View>
                                                    <View className="flex-row justify-between mt-1">
                                                        <Text className="text-gray-300 text-xs">Tempo: {ex.default_time ?? '—'}</Text>
                                                        <Text className="text-gray-300 text-xs">Descanso: {ex.default_rest ?? '—'}</Text>
                                                    </View>
                                                </View>
                                            ))
                                        )
                                    )}
                                    <View className="mt-2">
                                        <TouchableOpacity className="bg-[#60A5FA] px-3 py-2 rounded-lg" onPress={() => openAddExercise(treino.id!)}>
                                            <Text className="text-white font-semibold">Adicionar exercício</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </LiquidGlassCard>
                    ))}
                </View>
            </ScrollView>

            {showCreateModal && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <BlurView intensity={80} tint="dark" style={{ width: '100%', maxWidth: 420, borderRadius: 20, overflow: 'hidden' }}>
                        <View className="bg-[#141c30] p-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white text-xl font-bold">Novo Treino</Text>
                                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View className="mb-3">
                                <Text className="text-gray-400 text-sm mb-2">Nome *</Text>
                                <TextInput
                                    className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                                    placeholder="Digite o nome do treino"
                                    placeholderTextColor="#6B7280"
                                    value={newTrainingName}
                                    onChangeText={setNewTrainingName}
                                />
                            </View>
                            <View className="mb-3">
                                <Text className="text-gray-400 text-sm mb-2">Dia da semana (opcional)</Text>
                                <TextInput
                                    className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                                    placeholder="Ex: Segunda, Treino 1"
                                    placeholderTextColor="#6B7280"
                                    value={newTrainingDayOfWeek}
                                    onChangeText={setNewTrainingDayOfWeek}
                                />
                            </View>
                            <View className="mb-3">
                                <Text className="text-gray-400 text-sm mb-2">Observações (opcional)</Text>
                                <TextInput
                                    className="bg-[#0B1120] text-white px-4 py-3 rounded-lg"
                                    placeholder="Adicione observações sobre o treino"
                                    placeholderTextColor="#6B7280"
                                    value={newTrainingNotes}
                                    onChangeText={setNewTrainingNotes}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>
                            <View className="flex-row gap-3 mt-2">
                                <TouchableOpacity className="flex-1 bg-gray-600 rounded-lg p-4 items-center" onPress={() => setShowCreateModal(false)}>
                                    <Text className="text-white font-semibold">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-[#60A5FA] rounded-lg p-4 items-center" onPress={handleCreateTraining}>
                                    <Text className="text-white font-semibold">Criar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                </View>
            )}

            {showAddExerciseModal && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <BlurView intensity={80} tint="dark" style={{ width: '100%', maxWidth: 520, borderRadius: 20, overflow: 'hidden' }}>
                        <View className="bg-[#141c30] p-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white text-xl font-bold">Adicionar Exercício</Text>
                                <TouchableOpacity onPress={() => setShowAddExerciseModal(false)}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View className="mb-3">
                                <View className="flex-row items-center bg-[#0B1120] px-4 py-3 rounded-xl">
                                    <Ionicons name="search" size={18} color="#60A5FA" />
                                    <TextInput
                                        className="flex-1 text-white text-base ml-2"
                                        placeholder="Buscar exercícios..."
                                        placeholderTextColor="#6B7280"
                                        value={exerciseSearchTerm}
                                        onChangeText={setExerciseSearchTerm}
                                    />
                                </View>
                            </View>
                            <ScrollView style={{ maxHeight: 220 }}>
                                {exercisesLoading ? (
                                    <View className="items-center py-6">
                                        <ActivityIndicator color="#60A5FA" />
                                    </View>
                                ) : (
                                    filteredExercises.map((e) => (
                                        <TouchableOpacity key={e.id} className={`p-3 rounded-lg mb-2 ${selectedExerciseId === e.id ? 'bg-[#1e2a47]' : 'bg-[#0B1120]'}`} onPress={() => setSelectedExerciseId(e.id!)}>
                                            <Text className="text-white font-semibold">{e.name}</Text>
                                            {e.muscle_group && <Text className="text-gray-400 text-xs mt-1">{e.muscle_group}</Text>}
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                            <View className="mt-4">
                                <Text className="text-white font-semibold mb-2">Tipo de Repetição (opcional)</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {['reps-load','reps-load-time','complete-set','reps-time'].map((t) => (
                                        <TouchableOpacity key={t} className={`px-3 py-2 rounded-lg ${repType === t ? 'bg-[#60A5FA]' : 'bg-[#1e2a47]'}`} onPress={() => setRepType(t as any)}>
                                            <Text className="text-white text-xs">{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View className="mt-3">
                                    <View className="flex-row gap-2">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Carga</Text>
                                            <TextInput className="bg-[#0B1120] text-white px-3 py-2 rounded-lg" placeholder="Ex: 30" placeholderTextColor="#6B7280" keyboardType="decimal-pad" value={defaultLoad} onChangeText={setDefaultLoad} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Séries</Text>
                                            <TextInput className="bg-[#0B1120] text-white px-3 py-2 rounded-lg" placeholder="Ex: 4" placeholderTextColor="#6B7280" keyboardType="number-pad" value={defaultSet} onChangeText={setDefaultSet} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Reps</Text>
                                            <TextInput className="bg-[#0B1120] text-white px-3 py-2 rounded-lg" placeholder="Ex: 12" placeholderTextColor="#6B7280" keyboardType="number-pad" value={defaultReps} onChangeText={setDefaultReps} />
                                        </View>
                                    </View>
                                    <View className="flex-row gap-2 mt-2">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Tempo (s)</Text>
                                            <TextInput className="bg-[#0B1120] text-white px-3 py-2 rounded-lg" placeholder="Ex: 30" placeholderTextColor="#6B7280" keyboardType="number-pad" value={defaultTime} onChangeText={setDefaultTime} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Descanso (s)</Text>
                                            <TextInput className="bg-[#0B1120] text-white px-3 py-2 rounded-lg" placeholder="Ex: 60" placeholderTextColor="#6B7280" keyboardType="number-pad" value={defaultRest} onChangeText={setDefaultRest} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-row gap-3 mt-4">
                                <TouchableOpacity className="flex-1 bg-gray-600 rounded-lg p-4 items-center" onPress={() => setShowAddExerciseModal(false)}>
                                    <Text className="text-white font-semibold">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-[#60A5FA] rounded-lg p-4 items-center" onPress={handleAddExercise}>
                                    <Text className="text-white font-semibold">Adicionar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                </View>
            )}
            
            <RefreshSplash 
                visible={showRefreshSplash} 
                scale={splashScale} 
                opacity={splashOpacity} 
            />
        </View>
    );
}

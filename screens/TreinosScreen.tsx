import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';

type Treino = {
    id: string;
    titulo: string;
    duracao: string;
    dificuldade: 'Fácil' | 'Médio' | 'Difícil';
    imagem?: any;
};

export default function TreinosScreen() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<'workouts' | 'fitness' | 'plans' | 'training'>('workouts');
    const [treinos, setTreinos] = useState<Treino[]>([
        {
            id: '1',
            titulo: 'Treino de Peito em Casa (Sem Equipamento)',
            duracao: '45 min',
            dificuldade: 'Difícil',
            imagem: require('../assets/images/desenvolvimento.jpeg'),
        },
        {
            id: '2',
            titulo: 'Treino Completo de Pernas em Casa',
            duracao: '45 min',
            dificuldade: 'Médio',
            imagem: require('../assets/images/prancha.jpeg'),
        },
        {
            id: '3',
            titulo: 'Treino de Força Corpo Inteiro (Sem Pesos)',
            duracao: '55 min',
            dificuldade: 'Difícil',
            imagem: require('../assets/images/costas.jpeg'),
        },
        {
            id: '4',
            titulo: 'Treino Perfeito de Ombro em Casa',
            duracao: '15 min',
            dificuldade: 'Fácil',
            imagem: require('../assets/images/desenvolvimento.jpeg'),
        },
    ]);

    const getDificuldadeColor = (dificuldade: string) => {
        switch (dificuldade) {
            case 'Fácil':
                return 'bg-green-500';
            case 'Médio':
                return 'bg-yellow-500';
            case 'Difícil':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <View className="flex-1 bg-[#0B1F1F]">
            {/* Category Tabs */}
            <View className="flex-row px-4 pt-4 gap-2">
                <TouchableOpacity
                    onPress={() => setActiveCategory('workouts')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'workouts' ? 'bg-[#00C896]' : 'bg-[#1A3333]'}`}
                >
                    <Text className={`font-semibold ${activeCategory === 'workouts' ? 'text-white' : 'text-white'}`}>
                        Treinos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('fitness')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'fitness' ? 'bg-[#00C896]' : 'bg-[#1A3333]'}`}
                >
                    <Text className={`font-semibold ${activeCategory === 'fitness' ? 'text-white' : 'text-white'}`}>
                        Condicionamento
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('plans')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'plans' ? 'bg-[#00C896]' : 'bg-[#1A3333]'}`}
                >
                    <Text className={`font-semibold ${activeCategory === 'plans' ? 'text-white' : 'text-white'}`}>
                        Planos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveCategory('training')}
                    className={`px-5 py-2 rounded-full ${activeCategory === 'training' ? 'bg-[#00C896]' : 'bg-[#1A3333]'}`}
                >
                    <Text className={`font-semibold ${activeCategory === 'training' ? 'text-white' : 'text-white'}`}>
                        Treinamento
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Action Bar */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#1A3333]">
                <TouchableOpacity className="flex-row items-center gap-2 bg-[#1A3333] px-4 py-2 rounded-lg">
                    <Ionicons name="filter" size={20} color="#00C896" />
                    <Text className="text-white font-medium">Filtros</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2 bg-[#1A3333] px-4 py-2 rounded-lg">
                    <Ionicons name="swap-vertical" size={20} color="#00C896" />
                    <Text className="text-white font-medium">Ordenar</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2 bg-[#1A3333] px-4 py-2 rounded-lg">
                    <Ionicons name="search" size={20} color="#00C896" />
                    <Text className="text-white font-medium">Buscar</Text>
                </TouchableOpacity>
            </View>

            {/* Add New Button */}
            <View className="px-4 py-4">
                <TouchableOpacity className="bg-[#1A3333] rounded-2xl p-4 flex-row items-center justify-center gap-2">
                    <Ionicons name="add-circle-outline" size={24} color="#00C896" />
                    <Text className="text-white font-bold text-base">Criar Novo Treino</Text>
                </TouchableOpacity>
            </View>

            {/* Treinos Grid */}
            <ScrollView className="flex-1 px-4">
                <View className="flex-row flex-wrap justify-between pb-6">
                    {treinos.map((treino) => (
                        <TouchableOpacity 
                            key={treino.id} 
                            className="w-[48%] mb-6"
                            onPress={() => router.push(`/treino-details?id=${treino.id}`)}
                            activeOpacity={0.9}
                        >
                            {/* Card principal */}
                            <View className="rounded-2xl overflow-hidden relative shadow-lg">
                                {/* Imagem de fundo */}
                                <Image
                                    source={treino.imagem}
                                    className="w-full h-60"
                                    resizeMode="cover"
                                />

                                {/* Ícone Salvar */}
                                <TouchableOpacity className="absolute top-3 right-3 bg-black/40 w-8 h-8 rounded-lg items-center justify-center">
                                    <Ionicons name="bookmark" size={16} color="#00C896" />
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
                                            numberOfLines={2}
                                        >
                                            {treino.titulo}
                                        </Text>

                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="play" size={13} color="#ddd" />
                                                <Text className="text-gray-300 text-xs font-medium">
                                                    {treino.duracao}
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1">
                                                <Text className="text-white text-xs font-bold">AAA</Text>
                                                <Text className="text-gray-300 text-xs">
                                                    {treino.dificuldade}
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

        </View>
    );
}

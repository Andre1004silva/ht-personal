import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TreinoDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock data - em produção, você buscaria os dados baseado no ID
  const treino = {
    id: params.id,
    titulo: 'Home Chest Workout\n(No Equipment)',
    duracao: '45 min',
    calorias: '381 Cal',
    imagem: require('../assets/images/desenvolvimento.jpeg'),
    nivel: 'AAA Hard',
    progresso: '0%',
    focoArea: 'Chest',
    descricao: 'Building chest muscles doesn\'t have to be complicated, these 8 bodyweight exercises that will give you excellent results at home. No equipment.',
    trainer: {
      nome: 'Chris Heria',
      cargo: 'High Intensity Fitness Trainer',
      experiencia: '7 years experience',
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    rating: 4.6,
    totalRatings: 174,
    exercicios: [
      {
        id: 1,
        nome: 'Push Ups',
        repeticoes: '20 reps',
        imagem: require('../assets/images/desenvolvimento.jpeg'),
      },
      {
        id: 2,
        nome: '90° Hold',
        duracao: '20 sec',
        imagem: require('../assets/images/prancha.jpeg'),
      },
      {
        id: 3,
        nome: 'Push Ups in a Circle',
        repeticoes: '8 reps both directions',
        imagem: require('../assets/images/costas.jpeg'),
      },
    ],
  };

  return (
    <View className="flex-1 bg-[#0B1120]">
      <ScrollView className="flex-1">
        {/* Header com imagem */}
        <View style={styles.headerContainer}>
          <Image
            source={treino.imagem}
            style={styles.headerImage}
            resizeMode="cover"
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(11, 17, 32, 0.8)', '#0B1120']}
            style={styles.gradient}
          />

          {/* Botão voltar */}
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Informações sobre a imagem */}
          <View style={styles.headerInfo}>
            <Text className="text-white text-2xl font-bold mb-3">
              {treino.titulo}
            </Text>
            <View className="flex-row gap-3">
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{treino.duracao}</Text>
              </View>
              <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Ionicons name="flame-outline" size={16} color="white" />
                <Text className="text-white text-sm font-semibold">{treino.calorias}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Conteúdo */}
        <View className="px-5 pb-6">
          {/* About Section */}
          <View style={{
            backgroundColor: '#141c30',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Text className="text-white text-lg font-bold mb-3">About</Text>
            <Text className="text-gray-300 text-sm leading-6 mb-4">
              {treino.descricao}
            </Text>

            {/* Stats */}
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Level</Text>
                <Text className="text-[#3B82F6] text-sm font-bold">{treino.nivel}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Progress</Text>
                <Text className="text-[#2563EB] text-sm font-bold">{treino.progresso}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Focus Area</Text>
                <Text className="text-white text-sm font-bold">{treino.focoArea}</Text>
              </View>
            </View>
          </View>

          {/* Sound & Music */}
          <TouchableOpacity style={{
            backgroundColor: '#141c30',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Text className="text-white text-base font-semibold">Sound & Music</Text>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
          </TouchableOpacity>

          {/* Guide */}
          <TouchableOpacity style={{
            backgroundColor: '#141c30',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Text className="text-white text-base font-semibold">Guide</Text>
            <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
          </TouchableOpacity>

          {/* Trainer */}
          <View style={{
            backgroundColor: '#141c30',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Text className="text-white text-lg font-bold mb-3">Trainer</Text>
            <TouchableOpacity className="flex-row items-center">
              <Image
                source={{ uri: treino.trainer.foto }}
                style={styles.trainerPhoto}
              />
              <View className="flex-1 ml-3">
                <Text className="text-white text-base font-bold">{treino.trainer.nome}</Text>
                <Text className="text-gray-400 text-xs">{treino.trainer.cargo}</Text>
                <Text className="text-[#3B82F6] text-xs font-semibold mt-1">
                  {treino.trainer.experiencia}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#93C5FD" />
            </TouchableOpacity>
          </View>

          {/* Rating */}
          <View style={{
            backgroundColor: '#141c30',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Text className="text-white text-5xl font-bold mr-4">{treino.rating}</Text>
                <View>
                  <View className="flex-row mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={12}
                        color={star <= Math.floor(treino.rating) ? "#3B82F6" : "#444"}
                      />
                    ))}
                  </View>
                  <Text className="text-gray-400 text-xs">{treino.totalRatings} Ratings</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text className="text-[#93C5FD] text-sm font-semibold">See all</Text>
              </TouchableOpacity>
            </View>

            {/* Review exemplo */}
            <View className="flex-row">
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/45.jpg' }}
                style={styles.reviewerPhoto}
              />
              <View className="flex-1 ml-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-white text-sm font-bold">David Lewis</Text>
                  <Text className="text-gray-400 text-xs">3d ago</Text>
                </View>
                <Text className="text-gray-300 text-xs leading-5">
                  I had such an amazing session with Chris. He instantly picked up on the level of my fitness and adjusted the workout to suit me...
                </Text>
              </View>
              <View className="bg-[#3B82F6] w-10 h-10 rounded-lg items-center justify-center ml-2">
                <Text className="text-white text-sm font-bold">4.8</Text>
              </View>
            </View>
          </View>

          {/* Exercises */}
          <View style={{
            backgroundColor: '#141c30',
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}>
            <Text className="text-white text-lg font-bold mb-1">Exercises</Text>
            <Text className="text-gray-400 text-xs mb-4">8 STEPS • 4 SETS</Text>

            {treino.exercicios.map((exercicio, index) => (
              <TouchableOpacity
                key={exercicio.id}
                className="flex-row items-center mb-3"
              >
                <Image
                  source={exercicio.imagem}
                  style={styles.exerciseImage}
                />
                <View className="flex-1 ml-3">
                  <Text className="text-[#3B82F6] text-sm font-bold mb-1">
                    {exercicio.nome}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {exercicio.repeticoes || exercicio.duracao}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botões de Ação */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity className="flex-1 bg-[#3B82F6] rounded-2xl py-4 items-center flex-row justify-center gap-2">
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white text-base font-bold">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              flex: 1,
              backgroundColor: '#141c30',
              borderRadius: 24,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8
            }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: 'bold' }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    height: 320,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  trainerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  reviewerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
});

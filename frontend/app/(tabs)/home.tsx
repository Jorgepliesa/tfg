import { avatarService } from "@/services/avatarService";
import { StepsService }  from "@/services/stepsService"
import { UserService } from "@/services/userService";
import { sessionService } from "@/services/sessionService";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { router, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, Text, View, StyleSheet, ActivityIndicator, Platform, Dimensions, Image, Pressable, Alert, ScrollView } from "react-native";

export default function Home() {
  const router = useRouter();
  const [fp, setFp] = useState<number>(0);
  const [numSteps, setSteps] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Recargar datos cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los datos en paralelo
      const [fitnessPoints, numSteps] = await Promise.all([
        avatarService.getFitnessPoints(),
        UserService.getStepCount(), // Descomentar cuando esté implementado
      ]);

      setFp(fitnessPoints);
      setSteps(numSteps);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones de navegacion (Entrenar, tienda e inventario con scroll derecha)
  const goToExercises = async () => {
    try {
      setLoading(true);
      const { canStart } = await sessionService.canStartSession();
      if (true) {
        router.push('/(tabs)/routines');
      } else {
        Alert.alert('¡Buen trabajo!', 'Ya has completado tu entrenamiento de hoy. ¡Vuelve mañana!');
      }
    } catch (error) {
      console.error('Error checking session start:', error);
      Alert.alert('Error', 'Hubo un problema al comprobar tu sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goToShop = () => {
    try{
      setLoading(true);
      router.push('/(tabs)/shop');
    } catch (error) {
      console.error('Error navigating to shop:', error);
      Alert.alert('Error', 'Hubo un problema al navegar a la tienda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goToMemorials = () => {
    try {
      setLoading(true);
      router.push('/(tabs)/memorials');
    } catch (error) {
      console.error('Error navigating to memorials:', error);
      Alert.alert('Error', 'Hubo un problema al navegar al álbum. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner de pantalla completa mientras se cargan los datos
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6B5B95" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ImageBackground
        source={require('@/assets/images/Home.png')}
        style={styles.container}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
        {/* Contador de puntos de esfuerzo */}
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>
            P.E 🔥: {fp}
          </Text>
        </View>
        {/* Contador de pasos */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsText}>
            Pasos 👣: {numSteps}
          </Text>
        </View>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={require('@/assets/images/Avatar.png')}
            style={styles.avatarImage}
          />
        </View>
            {/* scroll horizontal para navegación inferior */}
            <ScrollView
                horizontal
                pagingEnabled
                snapToInterval={Dimensions.get('window').width}
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                style={styles.navScrollView}
                contentContainerStyle={styles.navScrollContent}
            >
                <View style={styles.navScreen}>
                    <Pressable
                        style={({ pressed }) => [styles.navButton, styles.navButtonShop, pressed && styles.buttonPressed]}
                        onPress={goToShop}
                    >
                        <MaterialIcons name="storefront" size={32} color="#fff" />
                        <Text style={styles.navButtonText}>Tienda</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.navButton, styles.navButtonTrain, pressed && styles.buttonPressed]}
                        onPress={goToExercises}
                    >
                        <Text style={styles.navButtonTrainText}>¡Entrenar!</Text>
                        <MaterialIcons name="fitness-center" size={36} color="#fff" />
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.navButton, styles.navButtonAlbum, pressed && styles.buttonPressed]}
                        onPress={goToMemorials}
                    >
                        <MaterialIcons name="photo-album" size={32} color="#fff" />
                        <Text style={styles.navButtonText}>Álbum</Text>
                    </Pressable>
                </View>

                {/* Segunda "página" del ScrollView (Inventario) */}
                <View style={styles.navScreen}>
                    <Pressable
                        style={({ pressed }) => [styles.navButton, styles.navButtonInventory, pressed && styles.buttonPressed]}
                        onPress={() => router.push('/(tabs)/inventory')}
                    >
                        <MaterialIcons name="backpack" size={48} color="#fff" />
                        <Text style={styles.navButtonInventoryText}>Ver Inventario</Text>
                    </Pressable>
                </View>
            </ScrollView>
      </ImageBackground>
    </View>
  );
}


const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    overflow: 'hidden', // Prevenir scroll en web
    ...Platform.select({
      web: {
        maxHeight: Dimensions.get('window').height,
        maxWidth: '100%',
      },
    }),
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },

  avatarContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -80 }], // Centrar (80 es la mitad de 160)
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
  },
  
  pointsContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6B5B95',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5B95',
  },
  stepsContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6B5B95',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  stepsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5B95',
  },
  enterButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7bf3dff',
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 200,
    minHeight: 60,
  },
  enterButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  navScrollView: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  navScrollContent: {
      alignItems: 'center',
      flexDirection: 'row',
  },
  navScreen: {
      width: Dimensions.get('window').width,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      gap: 16,
  },
  navButton: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 24,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      minWidth: 80,
      minHeight: 80,
      gap: 6,
  },
  navButtonTrain: { 
    backgroundColor: '#e7bf3dff',
    flexDirection: 'column',
    minWidth: 160,
    minHeight: 120,
    borderRadius: 30,
    gap: 8,
  },
  navButtonTrainText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  navButtonShop:  { backgroundColor: '#6B5B95' },
  navButtonInventory: { 
    backgroundColor: '#2D9E75',
    minWidth: 200,
    minHeight: 120,
    borderRadius: 30,
  },
  navButtonInventoryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  navButtonAlbum: { backgroundColor: '#c85a5a' },
  navButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
  },
});
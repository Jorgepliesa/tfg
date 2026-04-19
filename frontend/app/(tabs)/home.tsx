import { avatarService } from "@/services/avatarService";
import { StepsService }  from "@/services/stepsService"
import { UserService } from "@/services/userService";
import { sessionService } from "@/services/sessionService";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { router, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ImageBackground, Text, View, StyleSheet, ActivityIndicator, Platform, Dimensions, Image, Pressable, Alert } from "react-native";

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
      if (true) { // canStart
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
            {/* Botón de entrada */}
            <Pressable
                style={({ pressed }) => [
                    styles.enterButton,
                    pressed && styles.buttonPressed,
                ]}
                onPress={goToExercises}
            >
                <Text style={styles.enterButtonText}>Entrenar!</Text>
                <MaterialIcons name="fitness-center" size={28} color="#fff" />
            </Pressable>
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
});
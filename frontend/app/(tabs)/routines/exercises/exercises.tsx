import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../../../context/SessionContext';
import { useState, useEffect } from 'react';

export default function Exercises() {
    const router = useRouter();
    const { sessionId } = useLocalSearchParams();
    const { exercises, currentExerciseIndex, moveToNextExercise, addExecutedExercise } = useSession();

    const [isResting, setIsResting] = useState(false);
    const [tInitial, setTInitial] = useState(new Date());
    const [restTimer, setRestTimer] = useState(0);

    const currentExercise = exercises[currentExerciseIndex];

    useEffect(() => {
        if (!isResting) {
            setTInitial(new Date());
        }

        if(restTimer <= 0 && isResting){
            setIsResting(false);
            goToNext();
            return;
        }

        const timer = setInterval(() => {
            setRestTimer(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [currentExerciseIndex, isResting, restTimer]);

    const handleNext = () => {
        if (!isResting) {
            // Log the exercise
            addExecutedExercise({
                exercise: currentExercise.exerciseName,
                numRepsDone: currentExercise.numReps,
                tInitial: tInitial,
                tFinal: new Date()
            });

            // If it has rest time, go to rest
            if (currentExercise.rest > 0) {
                setRestTimer(currentExercise.rest);
                setIsResting(true);
            } else {
                goToNext();
            }
        } else {
            // Finished rest
            setIsResting(false);
            goToNext();
        }
    };

    const goToNext = () => {
        if (currentExerciseIndex >= exercises.length - 1) {
            // Reached the end, go to final test
            router.push({ pathname: '/(tabs)/routines/wellnessTest', params: { type: 'final' } });
            return;
        }
        moveToNextExercise();
    };

    if (!currentExercise) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.container}>
                    <Text style={styles.placeholder}>Cargando ejercicios...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isResting) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={[styles.container, { backgroundColor: '#E8F5E9' }]}>
                    <MaterialCommunityIcons name="timer-sand" size={80} color="#4CAF50" />
                    <Text style={[styles.mainTitle, { marginTop: 16 }]}>¡Descanso!</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginVertical: 20 }}>
                        {restTimer} segundos
                    </Text>
                    <Pressable 
                        style={({ pressed }) => [
                            styles.nextButton,
                            pressed && styles.nextButtonPressed,
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>Continuar</Text>
                        <MaterialIcons name="arrow-forward" size={28} color="#fff" />
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.header}>
                <Pressable 
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && { opacity: 0.6 }
                    ]}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>Ejercicio</Text>
                <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.mainTitle}>{currentExercise.exerciseName}</Text>

            {/* Audiovisual */}
            <View style={styles.container}>
                <Text style={styles.placeholder}>[Aquí se mostraría el video o imagen del ejercicio]</Text>
            </View>

            {/* Repeticiones y series */}
            <View style={styles.container}>
                <Text style={styles.placeholder}>
                    Repeticiones: {currentExercise.numReps} | Series: {currentExercise.numSeries}
                </Text>
                {currentExercise.duration && (
                    <Text style={styles.placeholder}>
                        Duración: {currentExercise.duration}
                    </Text>
                )}
            </View>

            {/* Descripción */}
            <View style={styles.container}>
                <Text style={styles.placeholder}>{currentExercise.description}</Text>
            </View>

            {/* Botón Siguiente */}
            <Pressable 
                style={({ pressed }) => [
                    styles.nextButton,
                    pressed && styles.nextButtonPressed,
                ]}
                onPress={handleNext}
            >
                <Text style={styles.nextButtonText}>Siguiente</Text>
                <MaterialIcons name="arrow-forward" size={28} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'lightcyan',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 12,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: '#2D3E50',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 44,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2D3E50',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 28,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        fontSize: 16,
        color: '#999',
    },

     // ← BOTÓN SIGUIENTE
    nextButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6B5B95',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        minWidth: 180,
        minHeight: 56,
        gap: 12,
    },
    nextButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
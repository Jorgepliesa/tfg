import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useSession } from '../../../context/SessionContext';
import { sessionService } from '../../../services/sessionService';
import { wellnessTestService } from '../../../services/wellnessTestService';

type CategoryType = 'pain' | 'fatigue' | 'sleepiness' | 'mood';

const CATEGORIES: CategoryType[] = ['pain', 'fatigue', 'sleepiness', 'mood'];

const categoryLabels = {
    pain: '¿Cuánto te sientes de dolorido?',
    fatigue: '¿Cuánta fatiga sientes?',
    sleep: '¿Cómo fue tu sueño?',
    mood: '¿Cuál es tu ánimo?',
};

export default function WellnessTest() {
    const router = useRouter();
    const { routineName, setInitialTest, sessionDate, setSessionDuration } = useSession();
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ratings, setRatings] = useState<Record<CategoryType, number | null>>({
        pain: null,
        fatigue: null,
        sleepiness: null,
        mood: null,
    });
    
    const currentCategory = CATEGORIES[categoryIndex] as CategoryType;
    
    const handleRatingChange = (rating: number) => {
        setSelectedRating(rating);
        setRatings({ ...ratings, [currentCategory]: rating });
    };

    const handleNext = async () => {
        if (selectedRating === null) return;
        
        const nextIndex = categoryIndex + 1;
        
        if (nextIndex < CATEGORIES.length) {
            // Ir a la siguiente categoría
            setCategoryIndex(nextIndex);
            setSelectedRating(ratings[CATEGORIES[nextIndex]] ?? null);
        } else {
            // Todas las categorías completadas, ir a ejercicios
            await saveInitialTest();
        }
    };

    const saveInitialTest = async () => {
        try {
            setLoading(true);
            
            // Crear sesión en backend
            const sessionResponse = await sessionService.startSession({
                routine: routineName || 'Unknown',
                isCoop: false,
            });
            
            // Guardar test inicial
            await wellnessTestService.createTest({
                pain: ratings.pain || 3,
                sleepiness: ratings.sleepiness || 3,
                mood: ratings.mood || 3,
                fatigue: ratings.fatigue || 3,
                type: 'INITIAL',
            });
            
            // Guardar en contexto
            setInitialTest({
                pain: ratings.pain || 3,
                sleepiness: ratings.sleepiness || 3,
                mood: ratings.mood || 3,
                fatigue: ratings.fatigue || 3,
            });
            
            // Ir a ejercicios
            router.push('/(tabs)/routines/exercises/exercises');
        } catch (error) {
            console.error('Error saving initial test:', error);
            Alert.alert('Error', 'No se pudo guardar el test inicial');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Header Minimalista */}
            <View style={styles.header}>
                <Pressable 
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && { opacity: 0.6 }
                    ]}
                    onPress={() => router.back()} // TODO: gestionar bien el back
                >
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>Pre-ejercicio</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Indicador de progreso */}
            <Text style={styles.progressText}>
                Pregunta {categoryIndex + 1} de {CATEGORIES.length}
            </Text>

            {/* Título */}
            <Text style={styles.mainTitle}>{currentCategory}</Text>

            {/* Escala Likert 5 puntos centrada (2-2-1) */}
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.likertGridContainer}>
                    {/* Fila 1: 2 botones */}
                    <View style={styles.likertRow}>
                        {[
                            { rating: 1, icon: 'emoticon-cry', label: 'Muy mal', color: '#E74C3C' },
                            { rating: 2, icon: 'emoticon-sad', label: 'Mal', color: '#F39C12' },
                        ].map(({ rating, icon, label, color }) => (
                            <Pressable
                                key={rating}
                                style={[
                                    styles.likertButton,
                                    selectedRating === rating && styles.likertButtonSelected,
                                ]}
                                onPress={() => handleRatingChange(rating)}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={selectedRating === rating ? 100 : 90}
                                    color={color}
                                    style={{ marginBottom: 4 }}
                                />
                                <Text style={[
                                    styles.likertButtonLabel,
                                    selectedRating === rating && styles.likertButtonLabelSelected,
                                ]}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Fila 2: 2 botones */}
                    <View style={styles.likertRow}>
                        {[
                            { rating: 3, icon: 'emoticon-neutral', label: 'Regular', color: '#F1C40F' },
                            { rating: 4, icon: 'emoticon-happy', label: 'Bien', color: '#57EA94' },
                        ].map(({ rating, icon, label, color }) => (
                            <Pressable
                                key={rating}
                                style={[
                                    styles.likertButton,
                                    selectedRating === rating && styles.likertButtonSelected,
                                ]}
                                onPress={() => handleRatingChange(rating)}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={selectedRating === rating ? 100 : 90}
                                    color={color}
                                    style={{ marginBottom: 4 }}
                                />
                                <Text style={[
                                    styles.likertButtonLabel,
                                    selectedRating === rating && styles.likertButtonLabelSelected,
                                ]}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Fila 3: 1 botón (centrado) */}
                    <View style={styles.likertRow}>
                        {[
                            { rating: 5, icon: 'emoticon', label: 'Muy bien', color: '#127E3F' },
                        ].map(({ rating, icon, label, color }) => (
                            <Pressable
                                key={rating}
                                style={[
                                    styles.likertButton,
                                    selectedRating === rating && styles.likertButtonSelected,
                                ]}
                                onPress={() => handleRatingChange(rating)}
                            >
                                <MaterialCommunityIcons
                                    name={icon as any}
                                    size={selectedRating === rating ? 100 : 90}
                                    color={color}
                                    style={{ marginBottom: 4 }}
                                />
                                <Text style={[
                                    styles.likertButtonLabel,
                                    selectedRating === rating && styles.likertButtonLabelSelected,
                                ]}>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
            
            {/* Botón Siguiente */}
            {selectedRating !== null && (
                <Pressable 
                    style={({ pressed }) => [
                        styles.nextButton,
                        pressed && styles.nextButtonPressed,
                        loading && styles.nextButtonDisabled,
                    ]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.nextButtonText}>
                                {categoryIndex === CATEGORIES.length - 1 ? 'Empezar ejercicios' : 'Siguiente'}
                            </Text>                    
                            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                        </>
                    )}
                </Pressable>
            )}
            
        </SafeAreaView> 
    );
}



const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'lightcyan',
    },

    // ← HEADER MINIMALISTA
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'transparent', // Sin fondo
        borderBottomWidth: 0, // Sin separación
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 12,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        // Sin fondo - icono flotante
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600', // Semi-bold, no tan heavy
        color: '#2D3E50', // Gris oscuro suave
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 44, // Mismo tamaño que el botón para centrar bien el título
    },

    progressText: {
        fontSize: 14,
        color: '#9B9B9B',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },

    // ← TÍTULO PRINCIPAL
    mainTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2D3E50',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 28,
        textAlign: 'center',
        lineHeight: 32,
    },

    // ← SCROLL
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 20,
    },

    // ← ESCALA LIKERT (CENTRADA)
    likertGridContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 48,
        width: '100%',
        paddingBottom: 120,
    },
    likertRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 64,
        width: '100%',
    },
    likertButton: {
        width: 130,
        height: 140,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 8,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    likertButtonSelected: {
        backgroundColor: '#FFF9E6',
        borderColor: '#FFA500',
        elevation: 6,
        shadowColor: '#FFA500',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    likertButtonLabel: {
        fontSize: 22,
        fontWeight: '600',
        color: '#6B7D8F',
        textAlign: 'center',
    },
    likertButtonLabelSelected: {
        color: '#2D3E50',
        fontSize: 22,
        fontWeight: '700',
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
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
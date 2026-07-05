import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '../../../context/SessionContext';
import { sessionService } from '../../../services/sessionService';
import { wellnessTestService } from '../../../services/wellnessTestService';

type CategoryType = 'pain' | 'fatigue' | 'sleepiness' | 'mood';

const CATEGORIES: CategoryType[] = ['pain', 'fatigue', 'sleepiness', 'mood'];


export default function WellnessTest() {
    const router = useRouter();
    const { type } = useLocalSearchParams();
    const { t } = useTranslation();
    const { routineName, setInitialTest, sessionDate, setSessionDuration, isCoop } = useSession();
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

            const sessionResponse = await sessionService.startSession({
                routine: routineName || 'Unknown',
                isCoop,
            });
            // Guardar test inicial
            await wellnessTestService.createTest({
                pain: ratings.pain || 3,
                sleepiness: ratings.sleepiness || 3,
                mood: ratings.mood || 3,
                fatigue: ratings.fatigue || 3,
                type: 'initial',
            });

            // Guardar en contexto
            setInitialTest({
                pain: ratings.pain || 3,
                sleepiness: ratings.sleepiness || 3,
                mood: ratings.mood || 3,
                fatigue: ratings.fatigue || 3,
            });

            // Ir a ejercicios
            if (type === 'final') {
                router.push('/(tabs)/home');
            } else {
                router.push('/(tabs)/session/exercises/exercises');
            }
        } catch (error) {
            console.error('Error saving initial test:', error);
            Alert.alert(t('wellnessTest.error.title'), t('wellnessTest.error.message'));
        } finally {
            setLoading(false);
        }
    };

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
                <Text style={styles.headerTitle}>{type === 'final'
                    ? t('wellnessTest.header_title_end')
                    : t('wellnessTest.header_title')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <Text style={styles.mainTitle}>{t(`wellnessTest.questions.${currentCategory}`)}</Text>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.likertGridContainer}>
                    <View style={styles.likertRow}>
                        {[
                            { rating: 1, icon: 'emoticon-cry', label: t('wellnessTest.likert.very_bad'), color: '#E74C3C' },
                            { rating: 2, icon: 'emoticon-sad', label: t('wellnessTest.likert.bad'), color: '#F39C12' },
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

                    <View style={styles.likertRow}>
                        {[
                            { rating: 3, icon: 'emoticon-neutral', label: t('wellnessTest.likert.neutral'), color: '#F1C40F' },
                            { rating: 4, icon: 'emoticon-happy', label: t('wellnessTest.likert.good'), color: '#57EA94' },
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

                    <View style={styles.likertRow}>
                        {[
                            { rating: 5, icon: 'emoticon', label: t('wellnessTest.likert.very_good'), color: '#127E3F' },
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
                                {categoryIndex === CATEGORIES.length - 1
                                    ? type === 'final'
                                        ? t('wellnessTest.buttons.finish')
                                        : t('wellnessTest.buttons.start')
                                    : t('wellnessTest.buttons.next')}
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
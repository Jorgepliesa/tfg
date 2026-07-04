import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // <-- Importamos para la traducción
import { useSession } from '@/context/SessionContext';
import { routineService } from '@/services/routineService';

export default function Categories() {
    const router = useRouter();
    const { t } = useTranslation();
    const { initSession } = useSession();
    const [loading, setLoading] = useState(false);

    const handleCardPress = async (category: string) => {
        try {
            setLoading(true);
            const suggestedRoutine = await routineService.suggestRoutine(category);
            const routineExercises = await routineService.getRoutineDetails(suggestedRoutine.routineName);

            initSession(category, suggestedRoutine.routineName, routineExercises);
            router.push('/(tabs)/session/wellnessTest');
        } catch (error) {
            console.error('Error al sugerir rutina:', error);
            Alert.alert(t('routines.error_title'), t('routines.error_message'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6B5B95" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Header Minimalista */}
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
                <Text style={styles.headerTitle}>{t('routines.header_title')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Título */}
                <Text style={styles.mainTitle}>
                    {t('routines.main_title')}
                </Text>

                {/* Recuadros de categorías */}
                <View style={styles.cardsContainer}>
                    {/* Categoría 1: Cardio */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.categoryCard,
                            styles.cardColor1,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => handleCardPress('aerobic')}
                    >
                        <Text style={styles.cardEmoji}>
                            <MaterialIcons name="directions-run" size={64} color="#6B5B95" />
                        </Text>
                        <Text style={styles.cardTitle}>{t('routines.categories.cardio.title')}</Text>
                        <Text style={styles.cardDescription}>
                            {t('routines.categories.cardio.description')}
                        </Text>
                    </Pressable>

                    {/* Categoría 2: Fuerza */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.categoryCard,
                            styles.cardColor2,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => handleCardPress('strength')}
                    >
                        <Text style={styles.cardEmoji}>
                            <MaterialIcons name="fitness-center" size={64} color="#6B5B95" />
                        </Text>
                        <Text style={styles.cardTitle}>{t('routines.categories.strength.title')}</Text>
                        <Text style={styles.cardDescription}>
                            {t('routines.categories.strength.description')}
                        </Text>
                    </Pressable>

                    {/* Categoría 3: Flexibilidad */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.categoryCard,
                            styles.cardColor3,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => handleCardPress('flexibility')}
                    >
                        <Text style={styles.cardEmoji}>
                            <MaterialIcons name="self-improvement" size={64} color="#6B5B95" />
                        </Text>
                        <Text style={styles.cardTitle}>{t('routines.categories.flexibility.title')}</Text>
                        <Text style={styles.cardDescription}>
                            {t('routines.categories.flexibility.description')}
                        </Text>
                    </Pressable>

                    {/* Categoría 4: Equilibrio */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.categoryCard,
                            styles.cardColor4,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => handleCardPress('balance')}
                    >
                        <Text style={styles.cardEmoji}>
                            <MaterialIcons name="balance" size={64} color="#6B5B95" />
                        </Text>
                        <Text style={styles.cardTitle}>{t('routines.categories.balance.title')}</Text>
                        <Text style={styles.cardDescription}>
                            {t('routines.categories.balance.description')}
                        </Text>
                    </Pressable>
                </View>

                {/* Espacio adicional para scroll */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'lightcyan', // o lemonchiffon
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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

    // ← CONTENEDOR PRINCIPAL
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
    },

    // ← TÍTULO PRINCIPAL
    mainTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2D3E50',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 40,
    },

    // ← CONTENEDOR DE TARJETAS
    cardsContainer: {
        flexDirection: 'column',
        gap: 16,
    },

    // ← TARJETA DE CATEGORÍA (estilo Wellness)
    categoryCard: {
        padding: 28,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, // Sombra muy suave
        shadowRadius: 6,
        elevation: 3,
        ...Platform.select({
            web: {
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
            },
        }),
    },
    cardColor1: {
        backgroundColor: '#FFD9E8', // Rosa pastel más suave
    },
    cardColor2: {
        backgroundColor: '#D0E8F2', // Azul pastel más suave
    },
    cardColor3: {
        backgroundColor: '#C8F7DC', // Verde pastel más suave
    },
    cardColor4: {
        backgroundColor: '#FDEBD0', // Amarillo pastel más suave
    },
    cardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
    cardEmoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#2D3E50',
        marginTop: 12,
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 13,
        color: '#6B7D8F', // Gris suave
        textAlign: 'center',
        fontWeight: '500',
    },
});
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { routineService } from '../../../services/routineService';
import { useSession } from '../../../context/SessionContext';

interface RoutineListItem {
    name: string;
    category: string;
    difficulty: string;
    exerciseCount: number;
    isPersonal: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
const CATEGORY_TITLE_KEY: Record<string, string> = {
    aerobic: 'cardio', strength: 'strength', flexibility: 'flexibility', balance: 'balance',
};

export default function RoutineList() {
    const router = useRouter();
    const { category } = useLocalSearchParams<{ category: string }>();
    const { t } = useTranslation();
    const { initSession } = useSession();

    const [routines, setRoutines] = useState<RoutineListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await routineService.getMyRoutines(category);
                setRoutines(data);
            } catch {
                Alert.alert(t('routines.error_title'), t('routines.error_message'));
            } finally {
                setLoading(false);
            }
        })();
    }, [category]);

    const handleSelectRoutine = async (routineName: string) => {
        try {
            setSelecting(true);
            const routineExercises = await routineService.getRoutineDetails(routineName);
            initSession(category ?? '', routineName, routineExercises);
            router.push('/(tabs)/session/wellnessTest');
        } catch (error) {
            console.error('Error al cargar la rutina:', error);
            Alert.alert(t('routines.error_title'), t('routines.error_message'));
        } finally {
            setSelecting(false);
        }
    };

    if (loading || selecting) {
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
            <View style={styles.header}>
                <Pressable style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>
                    {t(`routines.categories.${CATEGORY_TITLE_KEY[category ?? ''] ?? 'cardio'}.title`)}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {routines.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inbox" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No hay rutinas en esta categoría todavía</Text>
                    </View>
                ) : (
                    routines.map((r) => (
                        <Pressable
                            key={r.name}
                            style={({ pressed }) => [styles.routineCard, pressed && styles.routineCardPressed]}
                            onPress={() => handleSelectRoutine(r.name)}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.routineName}>{r.name}</Text>
                                <Text style={styles.routineMeta}>
                                    {r.exerciseCount} ejercicios · {DIFFICULTY_LABEL[r.difficulty] ?? r.difficulty}
                                </Text>
                            </View>
                            {r.isPersonal && (
                                <View style={styles.personalBadge}>
                                    <Text style={styles.personalBadgeText}>Personalizada</Text>
                                </View>
                            )}
                            <MaterialIcons name="chevron-right" size={24} color="#6B5B95" />
                        </Pressable>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: 'lightcyan' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    backButton: { padding: 8, marginRight: 12, borderRadius: 12, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: '600', color: '#2D3E50', textAlign: 'center' },
    headerSpacer: { width: 44 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, gap: 12 },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: 16 },
    emptyText: { fontSize: 15, color: '#aaa', textAlign: 'center' },
    routineCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#fff', borderRadius: 18, padding: 16,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    routineCardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
    routineName: { fontSize: 16, fontWeight: '700', color: '#2D3E50' },
    routineMeta: { fontSize: 13, color: '#888', marginTop: 2 },
    personalBadge: { backgroundColor: '#F0EDFF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    personalBadgeText: { fontSize: 10, fontWeight: '700', color: '#6B5B95' },
});
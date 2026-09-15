import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { appAlert } from '@/components/AppAlert';
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
    const { initSession, setIsCoop } = useSession();

    const [routines, setRoutines] = useState<RoutineListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [showCoopModal, setShowCoopModal] = useState(false);
    const [selectedRoutineName, setSelectedRoutineName] = useState<string | null>(null);

    const handleCoopAnswer = (coop: boolean) => {
        setIsCoop(coop);
        setShowCoopModal(false);
        if (selectedRoutineName) {
            handleSelectRoutine(selectedRoutineName);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await routineService.getMyRoutines(category);
                setRoutines(data);
            } catch {
                appAlert(t('routines.error_title'), t('routines.error_message'));
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
            appAlert(t('routines.error_title'), t('routines.error_message'));
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
                            onPress={() => {
                                setSelectedRoutineName(r.name);
                                setShowCoopModal(true);
                            }}
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

            {/* Bocadillo cooperativo */}
            <Modal visible={showCoopModal} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.bubble}>
                        <MaterialIcons name="groups" size={48} color="#6B5B95" style={styles.bubbleIcon} />
                        <Text style={styles.bubbleTitle}>{t('routines.questions.coop_title')}</Text>
                        <Text style={styles.bubbleSubtitle}>{t('routines.questions.coop_subtitle')}</Text>
                        <View style={styles.bubbleButtons}>
                            <Pressable
                                style={({ pressed }) => [styles.answerBtn, styles.answerBtnNo, pressed && { opacity: 0.8 }]}
                                onPress={() => handleCoopAnswer(false)}
                            >
                                <MaterialIcons name="person" size={22} color="#6B5B95" />
                                <Text style={styles.answerBtnTextNo}>{t('routines.questions.solo')}</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.answerBtn, styles.answerBtnYes, pressed && { opacity: 0.8 }]}
                                onPress={() => handleCoopAnswer(true)}
                            >
                                <MaterialIcons name="group" size={22} color="#fff" />
                                <Text style={styles.answerBtnTextYes}>{t('routines.questions.accompanied')}</Text>
                            </Pressable>
                        </View>
                        <Text style={styles.bonusHint}>{t('routines.questions.coop_bonus')}</Text>
                        <Pressable
                            style={styles.cancelLink}
                            onPress={() => setShowCoopModal(false)}
                        >
                            <Text style={styles.cancelLinkText}>{t('routines.questions.cancel')}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    bubble: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%', maxWidth: 380, alignItems: 'center' },
    bubbleIcon: { marginBottom: 12 },
    bubbleTitle: { fontSize: 20, fontWeight: '700', color: '#2D3E50', textAlign: 'center', marginBottom: 8 },
    bubbleSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
    bubbleButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    answerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, minHeight: 52 },
    answerBtnNo: { backgroundColor: '#F0EDFF' },
    answerBtnYes: { backgroundColor: '#6B5B95' },
    answerBtnTextNo: { fontSize: 15, fontWeight: '600', color: '#6B5B95' },
    answerBtnTextYes: { fontSize: 15, fontWeight: '600', color: '#fff' },
    bonusHint: { marginTop: 16, fontSize: 12, color: '#E07B54', fontWeight: '600', textAlign: 'center' },
    cancelLink: { marginTop: 16 },
    cancelLinkText: { fontSize: 14, color: '#999', textDecorationLine: 'underline' },
});
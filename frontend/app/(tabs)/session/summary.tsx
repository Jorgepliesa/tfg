import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/SessionContext';

function formatDuration(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) return `${seconds} s`;
    return `${minutes} min ${seconds}s`;
}

export default function SessionSummary() {
    const router = useRouter();
    const { t } = useTranslation();
    const { routineName, sessionDuration, fpGained, isCoop, resetSession } = useSession();

    const handleFinish = () => {
        resetSession();
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.content}>
                <MaterialIcons name="celebration" size={96} color="#F0C040" />
                <Text style={styles.title}>{t('sessionSummary.title')}</Text>
                <Text style={styles.subtitle}>
                    {t('sessionSummary.subtitle', { routine: routineName ?? '' })}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <MaterialIcons name="timer" size={32} color="#6B5B95" />
                        <Text style={styles.statValue}>{formatDuration(sessionDuration)}</Text>
                        <Text style={styles.statLabel}>{t('sessionSummary.time')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <MaterialIcons name="stars" size={32} color="#E9A93B" />
                        <Text style={styles.statValue}>+{fpGained}</Text>
                        <Text style={styles.statLabel}>{t('sessionSummary.points')}</Text>
                    </View>
                </View>

                {isCoop && (
                    <View style={styles.coopBadge}>
                        <MaterialIcons name="group" size={18} color="#6B5B95" />
                        <Text style={styles.coopBadgeText}>{t('sessionSummary.coopBonus')}</Text>
                    </View>
                )}

                <Pressable style={({ pressed }) => [styles.finishBtn, pressed && { opacity: 0.85 }]} onPress={handleFinish}>
                    <MaterialIcons name="check-circle" size={24} color="#fff" />
                    <Text style={styles.finishBtnText}>{t('sessionSummary.finish')}</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: 'lightcyan' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
    title: { fontSize: 26, fontWeight: '800', color: '#2D3E50', textAlign: 'center', marginTop: 8 },
    subtitle: { fontSize: 15, color: '#6B7D8F', textAlign: 'center', marginBottom: 16 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    statCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center',
        minWidth: 130, gap: 6, borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    statValue: { fontSize: 22, fontWeight: '800', color: '#2D3E50' },
    statLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
    coopBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#F0EDFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
    },
    coopBadgeText: { fontSize: 13, color: '#6B5B95', fontWeight: '600' },
    finishBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#6B5B95', paddingHorizontal: 32, paddingVertical: 16,
        borderRadius: 24, marginTop: 24, elevation: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4,
    },
    finishBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
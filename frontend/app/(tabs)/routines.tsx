import { useSession } from "@/context/SessionContext";
import { routineService } from "@/services/routineService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Modal, Pressable, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

type Step = 'equipment' | 'coop' | 'loading';

export default function Routines() {
    const router = useRouter();
    const { t } = useTranslation();
    const { initSession, setIsCoop } = useSession();

    const [step, setStep] = useState<Step>('equipment');
    const [hasEquipment, setHasEquipment] = useState<boolean | null>(null);

    const handleEquipmentAnswer = (answer: boolean) => {
        setHasEquipment(answer);
        setStep('coop');
    }

    const handleCoopAnswer = async (coop: boolean) => {
        setIsCoop(coop);
        setStep('loading');
        try {
            const suggestedRoutine = await routineService.recommendRoutine(hasEquipment ?? false);
            const routineExercises = await routineService.getRoutineDetails(suggestedRoutine.routineName);

            initSession(suggestedRoutine.category, suggestedRoutine.routineName, routineExercises);
            router.push('/(tabs)/session/wellnessTest');
        } catch (error) {
            console.error('Error al recomendar rutina:', error);
            Alert.alert(t('routines.error_title'), t('routines.error_message'));
            setStep('equipment');
        }
    };

    const goToCategories = () => {
        router.push('/(tabs)/session/categories');
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>{t('routines.header_title')}</Text>
                <Pressable
                    style={({ pressed }) => [styles.categoriesButton, pressed && { opacity: 0.6 }]}
                    onPress={goToCategories}
                    hitSlop={8}
                >
                    <MaterialIcons name="apps" size={22} color="#6B5B95" />
                </Pressable>
            </View>

            {step === 'loading' && (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#6B5B95" />
                    <Text style={styles.loadingText}>{t('routines.recommending')}</Text>
                </View>
            )}

            {/* Bocadillo 1: material */}
            <Modal visible={step === 'equipment'} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.bubble}>
                        <MaterialIcons name="fitness-center" size={48} color="#6B5B95" style={styles.bubbleIcon} />
                        <Text style={styles.bubbleTitle}>{t('routines.questions.equipment_title')}</Text>
                        <Text style={styles.bubbleSubtitle}>{t('routines.questions.equipment_subtitle')}</Text>
                        <View style={styles.bubbleButtons}>
                            <Pressable
                                style={({ pressed }) => [styles.answerBtn, styles.answerBtnNo, pressed && { opacity: 0.8 }]}
                                onPress={() => handleEquipmentAnswer(false)}
                            >
                                <MaterialIcons name="close" size={22} color="#6B5B95" />
                                <Text style={styles.answerBtnTextNo}>{t('routines.questions.no')}</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.answerBtn, styles.answerBtnYes, pressed && { opacity: 0.8 }]}
                                onPress={() => handleEquipmentAnswer(true)}
                            >
                                <MaterialIcons name="check" size={22} color="#fff" />
                                <Text style={styles.answerBtnTextYes}>{t('routines.questions.yes')}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bocadillo 2: solo o acompañado */}
            <Modal visible={step === 'coop'} transparent animationType="fade">
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
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: 'lightcyan' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    backButton: { padding: 8, marginRight: 12, borderRadius: 12, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, fontSize: 24, fontWeight: '600', color: '#2D3E50', textAlign: 'center' },
    categoriesButton: { padding: 8, borderRadius: 12, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0EDFF' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { fontSize: 16, color: '#6B5B95', fontWeight: '500' },
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
});
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Vibration, Modal } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { appAlert } from '@/components/AppAlert';
import { useSession } from '../../../../context/SessionContext';
import { useState, useEffect, useRef } from 'react';
import { executeService } from '../../../../services/executeService';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function Exercises() {
    const router = useRouter();
    const { t } = useTranslation();
    const { exercises, currentExerciseIndex, moveToNextExercise, addExecutedExercise, routineName } = useSession();

    const CATEGORY_TITLE_KEY: Record<string, string> = {
        aerobic: 'cardio', strength: 'fuerza', flexibility: 'flexibilidad', balance: 'equilibrio', warmup: 'calentamiento', stretching: 'estiramientos'
    };

    const [isResting, setIsResting] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [savingExercise, setSavingExercise] = useState(false);
    const [currentSerie, setCurrentSerie] = useState(1);
    const [repsThisSerie, setRepsThisSerie] = useState(0);
    const [completedSeries, setCompletedSeries] = useState<number[]>([]);
    const [pendingGoToNext, setPendingGoToNext] = useState(false);
    const [showIntroModal, setShowIntroModal] = useState(currentExerciseIndex === 0);

    const tInitialRef = useRef<Date>(new Date());
    const tapScaleAnim = useRef(new Animated.Value(1)).current;
    // Ref para saber si ya navegamos, evita doble goToNext
    const navigatingRef = useRef(false);

    const goToNext = () => {
        if (currentExerciseIndex >= exercises.length - 1) {
            // Reached the end, go to final test
            router.push({ pathname: '/(tabs)/session/wellnessTest', params: { type: 'final' } });
            return;
        }
        else {
            moveToNextExercise();
        }
    };

    // ── Temporizador del propio ejercicio (para ejercicios "por tiempo") ────
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);

    const currentExercise = exercises[currentExerciseIndex];
    const videoId = extractYoutubeId(currentExercise?.videoUrl);
    const isTimed = currentExercise?.duration != null && Number(currentExercise.duration) > 0;

    function extractYoutubeId(url?: string | null): string | null {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
            /(?:youtu\.be\/)([\w-]{11})/,
            /(?:youtube\.com\/embed\/)([\w-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    function formatCountdown(totalSeconds: number): string {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ── Efecto 1: reset al cambiar de ejercicio ──────────────────────────────
    useEffect(() => {
        if (!currentExercise || showIntroModal) return;
        tInitialRef.current = new Date();
        setCurrentSerie(1);
        setCompletedSeries([]);
        setIsResting(false);
        setPendingGoToNext(false);
        navigatingRef.current = false;

        const timed = currentExercise.duration != null && Number(currentExercise.duration) > 0;
        if (timed) {
            setTimeRemaining(Math.round(Number(currentExercise.duration) * 60));
            setTimerRunning(true);
            setRepsThisSerie(0);
        } else {
            setRepsThisSerie(currentExercise.numReps);
            setTimeRemaining(0);
            setTimerRunning(false);
        }
    }, [currentExerciseIndex, showIntroModal]);

    // ── Efecto 2: cuenta atrás del descanso (separado del anterior) ──────────
    useEffect(() => {
        if (!isResting) return;

        if (restTimer <= 0) {
            // Tiempo agotado — salir del descanso y preparar siguiente serie
            setIsResting(false);
            if (pendingGoToNext) {
                setPendingGoToNext(false);
                goToNext();
            } else {
                if (isTimed && currentExercise) {
                    setTimeRemaining(Math.round(Number(currentExercise.duration) * 60));
                    setTimerRunning(true);
                } else {
                    setRepsThisSerie(currentExercise?.numReps ?? 0);
                }
            }
            return;
        }

        const timer = setInterval(() => {
            setRestTimer(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isResting, restTimer, pendingGoToNext]);

    // ── Efecto 3: cuenta atrás del propio ejercicio (si es "por tiempo") ────
    useEffect(() => {
        if (!isTimed || !timerRunning || isResting) return;

        if (timeRemaining <= 0) {
            setTimerRunning(false);
            Vibration.vibrate(80);
            handleCompleteSerie();
            return;
        }

        const timer = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [isTimed, timerRunning, timeRemaining, isResting]);

    // ── animación del botón de completar rep ────────────────────────────────
    const animateTap = () => {
        Animated.sequence([
            Animated.timing(tapScaleAnim, {
                toValue: 0.92,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(tapScaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // ── completar serie ──────────────────────────────────────────────────────
    const handleCompleteSerie = () => {
        if (savingExercise || navigatingRef.current) return;
        animateTap();
        Vibration.vibrate(40);
        setTimerRunning(false);

        // Para ejercicios por tiempo, la "serie completada" son las reps marcadas en el ejercicio
        const valueForThisSerie = isTimed ? currentExercise.numReps : repsThisSerie;

        const newCompleted = [...completedSeries, valueForThisSerie];
        setCompletedSeries(newCompleted);

        const isLastSerie = currentSerie >= currentExercise.numSeries;

        if (isLastSerie) {
            // Ejercicio completado — guardar y pasar al siguiente
            handleFinishExercise(newCompleted);
        } else {
            // Mostrar descanso entre series
            setCurrentSerie(prev => prev + 1);
            setRestTimer(currentExercise.rest > 0 ? currentExercise.rest : 10);
            setIsResting(true);
        }
    };

    // ── Saltar descanso ──────────────────────────────────────────────────────
    const handleSkipRest = () => {
        setRestTimer(0);
        setIsResting(false);
        if (pendingGoToNext) {
            setPendingGoToNext(false);
            goToNext();
        } else {
            if (isTimed && currentExercise) {
                setTimeRemaining(Math.round(Number(currentExercise.duration) * 60));
                setTimerRunning(true);
            } else {
                setRepsThisSerie(currentExercise?.numReps ?? 0);
            }
        }
    };

    // ── guardar ejercicio en backend ─────────────────────────────────────────
    const handleFinishExercise = async (seriesCompleted: number[]) => {
        if (navigatingRef.current) return;
        navigatingRef.current = true;
        setSavingExercise(true);
        const tFinal = new Date();
        const totalReps = seriesCompleted.reduce((a, b) => a + b, 0);

        addExecutedExercise({
            exercise: currentExercise.exerciseName,
            numRepsDone: totalReps,
            numSeriesDone: currentExercise.numSeries,
            tInitial: tInitialRef.current,
            tFinal,
        });

        try {
            await executeService.createExecute({
                exercise: currentExercise.exerciseName,
                numRepsDone: totalReps,
                numSeriesDone: seriesCompleted.length,
                tInitial: tInitialRef.current.toISOString(),
                tFinal: tFinal.toISOString(),
            });
        } catch (error) {
            console.error('Error saving exercise:', error);
        } finally {
            setSavingExercise(false);
        }

        if (currentExerciseIndex >= exercises.length - 1) {
            goToNext();
        } else {
            setPendingGoToNext(true);
            setRestTimer(currentExercise.rest > 0 ? currentExercise.rest : 10);
            setIsResting(true);
        }
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

    // ── pantalla de descanso ─────────────────────────────────────────────────
    if (isResting) {
        const nextExercise = exercises[currentExerciseIndex + 1];
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={[styles.container, { backgroundColor: '#E8F5E9' }]}>
                    <MaterialCommunityIcons name="timer-sand" size={80} color="#4CAF50" />
                    <Text style={[styles.mainTitle, { marginTop: 16 }]}>¡Descanso!</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginVertical: 20 }}>
                        {restTimer} segundos
                    </Text>
                    <View style={styles.restNextBox}>
                        <Text style={styles.restNextLabel}>
                            {pendingGoToNext ? 'Siguiente ejercicio' : 'Serie siguiente'}
                        </Text>
                        <Text style={styles.restNextValue}>
                            {pendingGoToNext ? (nextExercise?.exerciseName ?? '') : `${currentSerie} de ${currentExercise.numSeries}`}
                        </Text>
                    </View>

                    {/* Resumen de series completadas */}
                    <View style={styles.seriesCompletedRow}>
                        {completedSeries.map((val, i) => (
                            <View key={i} style={styles.seriesBadge}>
                                <MaterialIcons name="check" size={12} color="#2D9E75" />
                                <Text style={styles.seriesBadgeText}>
                                    {isTimed ? formatCountdown(Math.round(Number(currentExercise.duration) * 60)) : `${val} reps`}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Bóton de saltar descanso */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.skipRestBtn,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={handleSkipRest}
                    >
                        <MaterialIcons name="skip-next" size={20} color="#6B5B95" />
                        <Text style={styles.skipRestText}>Saltar descanso</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    // ── pantalla de ejercicio ────────────────────────────────────────────────
    const progressPct = (currentSerie - 1) / currentExercise.numSeries;

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

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Barra de progreso del ejercicio */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { flex: progressPct }]} />
                    <View style={{ flex: 1 - progressPct }} />
                </View>

                <Text style={styles.mainTitle}>{currentExercise.exerciseName}</Text>

                {/* Dificultad y Categoría */}
                <View style={styles.badgesRow}>
                    <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{currentExercise.difficulty}</Text>
                    </View>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                            {t(`routines.categories.${CATEGORY_TITLE_KEY[currentExercise.category] || currentExercise.category}.title`, { defaultValue: currentExercise.category })}
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoValue}>
                            {isTimed ? formatCountdown(Math.round(Number(currentExercise.duration) * 60)) : currentExercise.numReps}
                        </Text>
                        <Text style={styles.infoLabel}>{isTimed ? 'duración' : 'objetivo'}</Text>
                    </View>
                    <View style={styles.infoSeparator} />
                    <View style={styles.infoBox}>
                        <Text style={styles.infoValue}>
                            {currentSerie}/{currentExercise.numSeries}
                        </Text>
                        <Text style={styles.infoLabel}>serie</Text>
                    </View>
                    <View style={styles.infoSeparator} />
                    <View style={styles.infoBox}>
                        <Text style={styles.infoValue}>{currentExercise.rest}s</Text>
                        <Text style={styles.infoLabel}>descanso</Text>
                    </View>
                </View>

                {/* Video placeholder */}
                <View style={styles.videoContainer}>
                    {videoId ? (
                        <YoutubePlayer height={230} videoId={videoId} play={false} />
                    ) : (
                        <>
                            <MaterialIcons name="play-circle-outline" size={80} color="#6B5B95" />
                            <Text style={styles.placeholder}>Sin vídeo disponible</Text>
                        </>
                    )}
                </View>

                {/* Descripción */}
                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{currentExercise.description}</Text>
                </View>

                {/* Material necesario */}
                <View style={styles.infoListBox}>
                    <View style={styles.infoListHeader}>
                        <MaterialIcons name="fitness-center" size={16} color="#6B5B95" />
                        <Text style={styles.infoListTitle}>Material necesario</Text>
                    </View>
                    {currentExercise.equipment.length > 0 ? (
                        <View style={styles.chipsRow}>
                            {currentExercise.equipment.map((item) => (
                                <View key={item} style={styles.chip}>
                                    <Text style={styles.chipText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.infoListEmpty}>Ninguno</Text>
                    )}
                </View>

                {/* Parámetros a medir */}
                <View style={styles.infoListBox}>
                    <View style={styles.infoListHeader}>
                        <MaterialIcons name="monitor-heart" size={16} color="#6B5B95" />
                        <Text style={styles.infoListTitle}>Parámetros a medir</Text>
                    </View>
                    {currentExercise.measurementParameters.length > 0 ? (
                        <View style={styles.chipsRow}>
                            {currentExercise.measurementParameters.map((item) => (
                                <View key={item} style={[styles.chip, styles.chipMeasurement]}>
                                    <Text style={styles.chipText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.infoListEmpty}>Ninguno</Text>
                    )}
                </View>

                {/* Selector de repeticiones */}
                {isTimed ? (
                    // ── Selector reemplazado por temporizador ────────────────────────
                    <View style={styles.timerBox}>
                        <Text style={styles.timerValue}>{formatCountdown(timeRemaining)}</Text>
                        <Text style={styles.timerLabel}>tiempo restante</Text>
                    </View>
                ) : (
                    <View style={styles.repsSelector}>
                        <Pressable
                            style={({ pressed }) => [styles.repsBtn, pressed && { opacity: 0.6 }, repsThisSerie <= 0 && styles.repsBtnDisabled]}
                            onPress={() => setRepsThisSerie(prev => Math.max(0, prev - 1))}
                            disabled={repsThisSerie <= 0}
                        >
                            <MaterialIcons name="remove" size={28} color="#6B5B95" />
                        </Pressable>

                        <View style={styles.repsValueBox}>
                            <Text style={styles.repsValue}>{repsThisSerie}</Text>
                            <Text style={styles.repsLabel}>
                                repeticiones
                                {repsThisSerie !== currentExercise.numReps && (
                                    <Text style={styles.repsMeta}> (objetivo: {currentExercise.numReps})</Text>
                                )}
                            </Text>
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.repsBtn, pressed && { opacity: 0.6 }, repsThisSerie >= currentExercise.numReps && styles.repsBtnDisabled]}
                            onPress={() => setRepsThisSerie(prev => Math.min(prev + 1, currentExercise.numReps))}
                            disabled={repsThisSerie >= currentExercise.numReps}
                        >
                            <MaterialIcons name="add" size={28} color="#6B5B95" />
                        </Pressable>
                    </View>
                )}

                {/* Botón completar serie */}
                <Animated.View style={[styles.completeBtnWrapper, { transform: [{ scale: tapScaleAnim }] }]}>
                    <Pressable
                        style={({ pressed }) => [styles.completeBtn, savingExercise && styles.completeBtnDisabled, pressed && { opacity: 0.85 }]}
                        onPress={handleCompleteSerie}
                        disabled={savingExercise}
                    >
                        <MaterialIcons
                            name={currentSerie >= currentExercise.numSeries ? 'check-circle' : 'done'}
                            size={28}
                            color="#fff"
                        />
                        <Text style={styles.completeBtnText}>
                            {isTimed
                                ? (currentSerie >= currentExercise.numSeries ? 'Terminar ahora' : 'Terminar serie ahora')
                                : (currentSerie >= currentExercise.numSeries ? '¡Ejercicio completado!' : `Serie ${currentSerie} completada`)}
                        </Text>
                    </Pressable>
                </Animated.View>

                {/* Series completadas */}
                {completedSeries.length > 0 && (
                    <View style={styles.completedSeriesRow}>
                        {completedSeries.map((val, i) => (
                            <View key={i} style={styles.completedSerieBadge}>
                                <MaterialIcons name="check" size={12} color="#2D9E75" />
                                <Text style={styles.completedSerieBadgeText}>
                                    S{i + 1}: {isTimed ? formatCountdown(Math.round(Number(currentExercise.duration) * 60)) : `${val}r`}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
            {/* Modal Introductorio */}
            <Modal visible={showIntroModal} transparent animationType="fade">
                <View style={styles.introOverlay}>
                    <View style={styles.introBox}>
                        <MaterialIcons name="fitness-center" size={64} color="#6B5B95" />
                        <Text style={styles.introTitle}>¡Prepárate!</Text>
                        <Text style={styles.introRoutineName}>{routineName}</Text>
                        <Text style={styles.introSubtitle}>Vamos a comenzar con tu rutina. ¡A darlo todo!</Text>
                        <Pressable
                            style={({ pressed }) => [styles.introButton, pressed && { opacity: 0.8 }]}
                            onPress={() => setShowIntroModal(false)}
                        >
                            <Text style={styles.introButtonText}>¡Empezar!</Text>
                            <MaterialIcons name="play-arrow" size={24} color="#fff" />
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'lightcyan'
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backButton: {
        padding: 8, marginRight: 12, borderRadius: 12,
        minWidth: 44, minHeight: 44,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: {
        flex: 1, fontSize: 18, fontWeight: '600',
        color: '#2D3E50', textAlign: 'center',
    },
    headerSpacer: {
        width: 44
    },
    mainTitle: {
        fontSize: 22, fontWeight: '700', color: '#2D3E50',
        marginHorizontal: 20, marginTop: 8, marginBottom: 4,
        textAlign: 'center',
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    difficultyBadge: {
        backgroundColor: '#F0EDFF',
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    },
    difficultyText: {
        fontSize: 12,
        color: '#6B5B95',
        fontWeight: '600'
    },
    categoryBadge: {
        backgroundColor: '#E8D5F5',
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#6B5B95',
        fontWeight: '600'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    placeholder: {
        fontSize: 14,
        color: '#aaa'
    },
    infoRow: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginVertical: 12,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    infoBox: {
        flex: 1,
        alignItems: 'center'
    },
    infoValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6B5B95'
    },
    infoLabel: {
        fontSize: 11,
        color: '#888',
        marginTop: 2
    },
    infoSeparator: {
        width: 1,
        height: 40,
        backgroundColor: '#E0E0E0'
    },
    descriptionBox: {
        marginHorizontal: 20, marginBottom: 16,
        backgroundColor: '#F5F3FF', borderRadius: 12, padding: 14,
    },
    descriptionText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
        textAlign: 'center'
    },
    nextButton: {
        alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#6B5B95',
        paddingVertical: 16, paddingHorizontal: 40,
        borderRadius: 30, elevation: 6,
        minWidth: 180, minHeight: 56, gap: 12,
        marginTop: 8,
    },
    nextButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }]
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff'
    },
    videoContainer: {
        height: 230, // Forzamos una altura fija para el video en el scroll
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 20,
        marginVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 0.5,
        borderColor: '#E0E0E0',
    },
    // Barra progreso
    progressBar: {
        flexDirection: 'row', height: 4,
        marginHorizontal: 16, borderRadius: 2,
        backgroundColor: '#E0E0E0', overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: { backgroundColor: '#6B5B95' },

    // Nombre
    exerciseName: {
        fontSize: 22, fontWeight: '700', color: '#2D3E50',
        textAlign: 'center', marginHorizontal: 20, marginTop: 8,
    },

    // Selector de repeticiones
    repsSelector: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: 20, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 20,
        borderWidth: 0.5, borderColor: '#E0E0E0',
        paddingVertical: 8, paddingHorizontal: 8,
    },
    repsBtn: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#F0EDFF',
        justifyContent: 'center', alignItems: 'center',
    },
    repsBtnDisabled: { opacity: 0.3 },
    repsValueBox: {
        flex: 1, alignItems: 'center',
    },
    repsValue: {
        fontSize: 40, fontWeight: '700', color: '#2D3E50', lineHeight: 44,
    },
    repsLabel: {
        fontSize: 12, color: '#888', textAlign: 'center',
    },
    repsMeta: { fontSize: 11, color: '#aaa' },

    // Botón completar serie
    completeBtnWrapper: {
        marginHorizontal: 20, marginBottom: 8,
    },
    completeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#6B5B95', borderRadius: 24,
        paddingVertical: 18, paddingHorizontal: 24,
        gap: 10, minHeight: 60,
        elevation: 4,
        shadowColor: '#6B5B95',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    completeBtnDisabled: { backgroundColor: '#C4B8E8' },
    completeBtnText: {
        fontSize: 18, fontWeight: '700', color: '#fff',
    },

    // Series completadas (resumen)
    completedSeriesRow: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'center', gap: 6,
        marginHorizontal: 20, marginBottom: 16,
    },
    completedSerieBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#E8F5E9', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 0.5, borderColor: '#C8F7DC',
    },
    completedSerieBadgeText: {
        fontSize: 12, color: '#2D7A4F', fontWeight: '600',
    },

    // Pantalla de descanso
    restTimer: {
        fontSize: 72, fontWeight: '700', color: '#2D9E75', lineHeight: 80,
    },
    restNextBox: {
        alignItems: 'center', marginTop: 8,
    },
    restNextLabel: { fontSize: 13, color: '#888' },
    restNextValue: { fontSize: 18, fontWeight: '600', color: '#2D3E50', marginTop: 2 },
    seriesCompletedRow: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'center', gap: 6, marginTop: 8,
    },
    seriesBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#fff', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    seriesBadgeText: { fontSize: 12, color: '#2D9E75', fontWeight: '600' },
    skipRestBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 16, backgroundColor: '#F0EDFF',
        borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10,
    },
    skipRestText: { fontSize: 14, color: '#6B5B95', fontWeight: '500' },
    timerBox: {
        alignItems: 'center', justifyContent: 'center',
        marginHorizontal: 20, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 20, paddingVertical: 24,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    timerValue: { fontSize: 48, fontWeight: '800', color: '#6B5B95', lineHeight: 54 },
    timerLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginTop: 4 },
    infoListBox: {
        marginHorizontal: 20, marginBottom: 12,
        backgroundColor: '#fff', borderRadius: 12, padding: 12,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    infoListHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6,
    },
    infoListTitle: { fontSize: 13, fontWeight: '600', color: '#2D3E50' },
    infoListEmpty: { fontSize: 13, color: '#aaa' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        backgroundColor: '#F0EDFF', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    chipMeasurement: { backgroundColor: '#E8F5E9' },
    chipText: { fontSize: 12, color: '#6B5B95', fontWeight: '500' },
    introOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center', padding: 24,
    },
    introBox: {
        backgroundColor: '#fff', borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 360, alignItems: 'center',
        elevation: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8,
    },
    introTitle: {
        fontSize: 26, fontWeight: '700', color: '#2D3E50', marginTop: 16, marginBottom: 8,
    },
    introRoutineName: {
        fontSize: 20, fontWeight: '600', color: '#6B5B95', marginBottom: 16, textAlign: 'center',
    },
    introSubtitle: {
        fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22,
    },
    introButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#6B5B95', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 24, width: '100%',
    },
    introButtonText: {
        fontSize: 18, fontWeight: '600', color: '#fff',
    },
});
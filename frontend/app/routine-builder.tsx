import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View, Text, StyleSheet, Pressable, ScrollView, TextInput,
    ActivityIndicator, Alert, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { routineService } from '@/services/routineService';

interface CatalogExercise {
    name: string; description: string; category: string; difficulty: string; isContraindicated: boolean;
}

interface PlanExercise {
    exerciseName: string; numReps: number; numSeries: number; duration: number; rest: number;
}

const CATEGORY_LABEL: Record<string, string> = {
    aerobic: 'Cardio', strength: 'Fuerza', flexibility: 'Flexibilidad', balance: 'Equilibrio',
};
const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };

export default function RoutineBuilder() {
    const router = useRouter();
    const { sourceRoutine } = useLocalSearchParams<{ sourceRoutine?: string }>();
    const isForking = !!sourceRoutine;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [catalog, setCatalog] = useState<CatalogExercise[]>([]);
    const [showCatalogPicker, setShowCatalogPicker] = useState(false);

    const [name, setName] = useState('');
    const [category, setCategory] = useState('aerobic');
    const [difficulty, setDifficulty] = useState('easy');
    const [plan, setPlan] = useState<PlanExercise[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const cat = await routineService.getExerciseCatalog();
                setCatalog(cat);

                if (sourceRoutine) {
                    const source = await routineService.getRoutineForEditing(sourceRoutine);
                    setName(`${source.routineName} (ajustada)`);
                    setCategory(source.category);
                    setDifficulty(source.difficulty);
                    setPlan(source.exercises.map((e: any) => ({
                        exerciseName: e.exerciseName,
                        numReps: e.numReps,
                        numSeries: e.numSeries,
                        duration: Number(e.duration),
                        rest: e.rest,
                    })));
                }
            } catch {
                Alert.alert('Error', 'No se pudo cargar la información necesaria');
            } finally {
                setLoading(false);
            }
        })();
    }, [sourceRoutine]);

    const addExercise = (exerciseName: string) => {
        if (plan.some(p => p.exerciseName === exerciseName)) {
            setShowCatalogPicker(false);
            return;
        }
        setPlan(prev => [...prev, { exerciseName, numReps: 10, numSeries: 3, duration: 3, rest: 60 }]);
        setShowCatalogPicker(false);
    };

    const removeExercise = (exerciseName: string) => {
        setPlan(prev => prev.filter(p => p.exerciseName !== exerciseName));
    };

    const updateExerciseField = (exerciseName: string, field: keyof PlanExercise, value: number) => {
        setPlan(prev => prev.map(p => p.exerciseName === exerciseName ? { ...p, [field]: value } : p));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Falta el nombre', 'Ponle un nombre a la rutina');
            return;
        }
        if (plan.length === 0) {
            Alert.alert('Sin ejercicios', 'Añade al menos un ejercicio');
            return;
        }

        setSaving(true);
        try {
            if (isForking) {
                await routineService.forkRoutine(sourceRoutine!, {
                    newName: name.trim(), category, difficulty, exercises: plan,
                });
            } else {
                await routineService.createRoutine({ name: name.trim(), category, difficulty, exercises: plan });
            }
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'No se pudo guardar la rutina';
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
        } finally {
            setSaving(false);
        }
    };

    const catalogByAvailability = catalog.filter(c => !plan.some(p => p.exerciseName === c.name));

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6B5B95" /></View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>{isForking ? 'Editar como nueva' : 'Nueva rutina'}</Text>
                <Pressable onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator size="small" color="#6B5B95" /> : <Text style={styles.saveText}>Guardar</Text>}
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.label}>Nombre de la rutina</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Fuerza para Ana" />

                <Text style={styles.label}>Categoría</Text>
                <View style={styles.chipRow}>
                    {Object.keys(CATEGORY_LABEL).map(c => (
                        <Pressable key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{CATEGORY_LABEL[c]}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Dificultad</Text>
                <View style={styles.chipRow}>
                    {Object.keys(DIFFICULTY_LABEL).map(d => (
                        <Pressable key={d} style={[styles.chip, difficulty === d && styles.chipActive]} onPress={() => setDifficulty(d)}>
                            <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>{DIFFICULTY_LABEL[d]}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.exercisesHeader}>
                    <Text style={styles.label}>Ejercicios</Text>
                    <Pressable style={styles.addBtn} onPress={() => setShowCatalogPicker(true)}>
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.addBtnText}>Añadir</Text>
                    </Pressable>
                </View>

                {plan.length === 0 && (
                    <Text style={styles.emptyText}>Aún no has añadido ningún ejercicio</Text>
                )}

                {plan.map(p => {
                    const info = catalog.find(c => c.name === p.exerciseName);
                    return (
                        <View key={p.exerciseName} style={styles.exerciseCard}>
                            <View style={styles.exerciseCardHeader}>
                                <Text style={styles.exerciseName}>{p.exerciseName}</Text>
                                <Pressable onPress={() => removeExercise(p.exerciseName)}>
                                    <MaterialIcons name="delete-outline" size={20} color="#E74C3C" />
                                </Pressable>
                            </View>
                            {info?.isContraindicated && (
                                <View style={styles.warningRow}>
                                    <MaterialIcons name="warning" size={14} color="#E07B54" />
                                    <Text style={styles.warningText}>Contraindicado para este usuario</Text>
                                </View>
                            )}
                            <View style={styles.exerciseFields}>
                                {(['numReps', 'numSeries', 'duration', 'rest'] as const).map(field => (
                                    <View key={field} style={styles.exerciseFieldBox}>
                                        <Text style={styles.exerciseFieldLabel}>
                                            {field === 'numReps' ? 'Reps' : field === 'numSeries' ? 'Series' : field === 'duration' ? 'Min' : 'Descanso (s)'}
                                        </Text>
                                        <TextInput
                                            style={styles.exerciseFieldInput}
                                            keyboardType="numeric"
                                            value={String(p[field])}
                                            onChangeText={(v) => updateExerciseField(p.exerciseName, field, parseFloat(v) || 0)}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <Modal visible={showCatalogPicker} animationType="slide" onRequestClose={() => setShowCatalogPicker(false)}>
                <SafeAreaView style={styles.safe}>
                    <View style={styles.header}>
                        <Pressable onPress={() => setShowCatalogPicker(false)}>
                            <MaterialIcons name="close" size={24} color="#6B5B95" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Elegir ejercicio</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {catalogByAvailability.map(ex => (
                            <Pressable key={ex.name} style={styles.catalogItem} onPress={() => addExercise(ex.name)}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.catalogItemName}>{ex.name}</Text>
                                    <Text style={styles.catalogItemMeta}>
                                        {CATEGORY_LABEL[ex.category]} · {DIFFICULTY_LABEL[ex.difficulty]}
                                    </Text>
                                </View>
                                {ex.isContraindicated && <MaterialIcons name="warning" size={18} color="#E07B54" />}
                                <MaterialIcons name="add-circle-outline" size={22} color="#6B5B95" />
                            </Pressable>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F3FF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0',
    },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#2D3E50' },
    saveText: { fontSize: 15, fontWeight: '600', color: '#6B5B95' },
    label: { fontSize: 13, fontWeight: '600', color: '#888', marginTop: 16, marginBottom: 8 },
    input: {
        backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#E0E0E0',
        padding: 12, fontSize: 15, color: '#2D3E50',
    },
    chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
    },
    chipActive: { backgroundColor: '#6B5B95', borderColor: '#6B5B95' },
    chipText: { fontSize: 13, color: '#888', fontWeight: '500' },
    chipTextActive: { color: '#fff' },
    exercisesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#6B5B95', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    },
    addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    emptyText: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 20 },
    exerciseCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    exerciseCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    exerciseName: { fontSize: 14, fontWeight: '600', color: '#2D3E50' },
    warningRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    warningText: { fontSize: 11, color: '#E07B54', fontWeight: '600' },
    exerciseFields: { flexDirection: 'row', gap: 8, marginTop: 10 },
    exerciseFieldBox: { flex: 1 },
    exerciseFieldLabel: { fontSize: 10, color: '#888', marginBottom: 4 },
    exerciseFieldInput: {
        backgroundColor: '#F5F3FF', borderRadius: 8, padding: 8, fontSize: 13,
        textAlign: 'center', color: '#2D3E50',
    },
    catalogItem: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    catalogItemName: { fontSize: 14, fontWeight: '600', color: '#2D3E50' },
    catalogItemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
});
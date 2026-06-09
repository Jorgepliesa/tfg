import { useRouter } from 'expo-router';
import {
    View, Text, StyleSheet, Pressable, ScrollView,
    ActivityIndicator, Alert, Modal, TextInput,
    Dimensions, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { clinicalProfileService } from '@/services/clinicalProfileService';
import { authService } from '@/services/authService';
import { exportDashboardPDF } from '@/services/pdfExportService';
import api from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH, 480); // cap en tablet

// ─── tipos ──────────────────────────────────────────────────────────────────
interface DashboardData {
    profile: {
        age: number; gender: string; height: number; weight: number;
        birthDate: string; diagnosis: string; treatmentEndDate: string; hospital: string;
    } | null;
    stats: { streak: number; todaySteps: number; sessionsThisMonth: number; };
    steps: { date: string; numSteps: number; isReached: boolean; }[];
    sessions: {
        total: number; completed: number;
        categoryCount: Record<string, number>;
    };
    wellness: {
        pain: number; fatigue: number; sleepiness: number; mood: number; count: number;
    } | null;
    adherence: {
        completed: number;
        planned: number;
        pct: number;
        status: 'green' | 'yellow' | 'red';
    };
    notes: {
        id: number;
        content: string;
        date: string;
    }[];
}

const GENDER_LABEL: Record<string, string> = {
    male: 'Masculino', female: 'Femenino', other: 'Otro',
};

const CATEGORY_LABEL: Record<string, string> = {
    aerobic: 'Cardio', strength: 'Fuerza',
    flexibility: 'Flexibilidad', balance: 'Equilibrio',
};

const CATEGORY_COLOR: Record<string, string> = {
    aerobic: '#FF6B6B', strength: '#6B5B95',
    flexibility: '#2D9E75', balance: '#E07B54',
};

const WELLNESS_COLOR = (val: number) => {
    if (val <= 2) return '#2D9E75';
    if (val <= 3.5) return '#E07B54';
    return '#E74C3C';
};

const WELLNESS_ARROW = (val: number) => val <= 2.5 ? '↓ mejora' : val <= 3.5 ? '→ estable' : '↑ atención';

// ─── subcomponentes ──────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: string; label: string }) {
    return (
        <View style={styles.sectionTitle}>
            <MaterialIcons name={icon as any} size={14} color="#888" />
            <Text style={styles.sectionTitleText}>{label.toUpperCase()}</Text>
        </View>
    );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
    return <View style={[styles.card, style]}>{children}</View>;
}

function MetricCard({
    label, value, valueColor, icon,
}: { label: string; value: string; valueColor?: string; icon: string; }) {
    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>
                <MaterialIcons name={icon as any} size={12} color="#888" /> {label}
            </Text>
            <Text style={[styles.metricValue, valueColor ? { color: valueColor } : {}]}>
                {value}
            </Text>
        </View>
    );
}

function StepsChart({ steps }: { steps: DashboardData['steps'] }) {
    if (!steps.length) return (
        <Card><Text style={styles.emptyText}>Sin datos de pasos</Text></Card>
    );

    const max = Math.max(...steps.map(s => s.numSteps), 1);
    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    return (
        <Card>
            <View style={styles.chartContainer}>
                {steps.map((s, i) => {
                    const pct = s.numSteps / max;
                    const dayIdx = new Date(s.date).getDay();
                    const label = dayLabels[(dayIdx + 6) % 7]; // lunes=0
                    const color = s.isReached ? '#534AB7' : pct > 0.5 ? '#7F77DD' : '#AFA9EC';
                    return (
                        <View key={i} style={styles.barWrapper}>
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { height: `${Math.max(pct * 100, 4)}%`, backgroundColor: color }]} />
                            </View>
                            <Text style={styles.barLabel}>{label}</Text>
                        </View>
                    );
                })}
            </View>
            <View style={styles.chartFooter}>
                <Text style={styles.chartNote}>Meta: 5.000 pasos</Text>
                <Text style={styles.chartNote}>
                    Media: {Math.round(steps.reduce((s, d) => s + d.numSteps, 0) / steps.length).toLocaleString()}
                </Text>
            </View>
        </Card>
    );
}

function SessionsChart({ sessions }: { sessions: DashboardData['sessions'] }) {
    const maxVal = Math.max(...Object.values(sessions.categoryCount), 1);
    return (
        <Card>
            {Object.entries(sessions.categoryCount).map(([cat, count]) => (
                <View key={cat} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                        <Text style={styles.progressLabel}>{CATEGORY_LABEL[cat] ?? cat}</Text>
                        <Text style={[styles.progressCount, { color: CATEGORY_COLOR[cat] }]}>
                            {count} sesiones
                        </Text>
                    </View>
                    <View style={styles.progressBg}>
                        <View style={[
                            styles.progressFill,
                            {
                                width: `${(count / maxVal) * 100}%`,
                                backgroundColor: CATEGORY_COLOR[cat],
                                opacity: count === 0 ? 0.2 : 1,
                            },
                        ]} />
                    </View>
                </View>
            ))}
            <Text style={styles.chartNote}>
                Total mes: {sessions.total} sesiones · {sessions.completed} completadas
            </Text>
        </Card>
    );
}

function WellnessCards({ wellness }: { wellness: NonNullable<DashboardData['wellness']> }) {
    const items = [
        { key: 'pain', label: 'Dolor', val: wellness.pain },
        { key: 'fatigue', label: 'Fatiga', val: wellness.fatigue },
        { key: 'sleepiness', label: 'Sueño', val: wellness.sleepiness },
        { key: 'mood', label: 'Ánimo', val: wellness.mood },
    ];
    return (
        <Card>
            <View style={styles.wellnessGrid}>
                {items.map(item => (
                    <View key={item.key} style={styles.wellnessItem}>
                        <Text style={styles.wellnessLabel}>{item.label}</Text>
                        <Text style={[styles.wellnessValue, { color: WELLNESS_COLOR(item.val) }]}>
                            {item.val}
                        </Text>
                        <Text style={[styles.wellnessTrend, { color: WELLNESS_COLOR(item.val) }]}>
                            {WELLNESS_ARROW(item.val)}
                        </Text>
                    </View>
                ))}
            </View>
            <Text style={[styles.chartNote, { marginTop: 10 }]}>
                Escala 1–5 · Basado en {wellness.count} registros (últimas 4 semanas)
            </Text>
        </Card>
    );
}

function DataRow({
    icon, label, value,
}: { icon: string; label: string; value: string; }) {
    return (
        <View style={styles.dataRow}>
            <View style={styles.dataRowLabel}>
                <MaterialIcons name={icon as any} size={15} color="#888" />
                <Text style={styles.dataRowLabelText}>{label}</Text>
            </View>
            <Text style={styles.dataRowValue}>{value}</Text>
        </View>
    );
}

function StreakRow({ streak }: { streak: number }) {
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const filled = Math.min(streak, 7);
    return (
        <Card>
            <View style={styles.streakDays}>
                {days.map((d, i) => (
                    <View
                        key={i}
                        style={[styles.streakDay, i < filled ? styles.streakDayFilled : styles.streakDayEmpty]}
                    >
                        <Text style={[styles.streakDayText, i < filled ? styles.streakDayTextFilled : {}]}>
                            {d}
                        </Text>
                    </View>
                ))}
            </View>
            <Text style={styles.chartNote} numberOfLines={1}>
                {streak} días consecutivos
            </Text>
        </Card>
    );
}

// ─── modal de edición ────────────────────────────────────────────────────────

function EditProfileModal({
    visible,
    initial,
    onClose,
    onSave,
}: {
    visible: boolean;
    initial: DashboardData['profile'];
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}) {
    const [form, setForm] = useState({
        age: initial?.age?.toString() ?? '',
        gender: initial?.gender ?? 'male',
        height: initial?.height?.toString() ?? '',
        weight: initial?.weight?.toString() ?? '',
        birthDate: initial?.birthDate ?? '',
        diagnosis: initial?.diagnosis ?? '',
        treatmentEndDate: initial?.treatmentEndDate ?? '',
        hospital: initial?.hospital ?? '',
    });
    const [saving, setSaving] = useState(false);

    const field = (label: string, key: keyof typeof form, keyboard: any = 'default') => (
        <View style={styles.formField}>
            <Text style={styles.formLabel}>{label}</Text>
            <TextInput
                style={styles.formInput}
                value={form[key]}
                onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                keyboardType={keyboard}
                placeholderTextColor="#aaa"
                placeholder={label}
            />
        </View>
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({
                age: parseInt(form.age),
                gender: form.gender,
                height: parseInt(form.height),
                weight: parseInt(form.weight),
                birthDate: form.birthDate,
                diagnosis: form.diagnosis,
                treatmentEndDate: form.treatmentEndDate,
                hospital: form.hospital,
            });
            onClose();
        } catch {
            Alert.alert('Error', 'No se pudieron guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.modalSafe}>
                <View style={styles.modalHeader}>
                    <Pressable onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="#6B5B95" />
                    </Pressable>
                    <Text style={styles.modalTitle}>Datos clínicos</Text>
                    <Pressable onPress={handleSave} disabled={saving}>
                        {saving
                            ? <ActivityIndicator size="small" color="#6B5B95" />
                            : <Text style={styles.modalSave}>Guardar</Text>}
                    </Pressable>
                </View>
                <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 20, gap: 4 }}>
                    {field('Edad', 'age', 'numeric')}
                    {field('Altura (cm)', 'height', 'numeric')}
                    {field('Peso (kg)', 'weight', 'numeric')}
                    {field('Fecha nacimiento (YYYY-MM-DD)', 'birthDate')}
                    {field('Diagnóstico', 'diagnosis')}
                    {field('Fin tratamiento (YYYY-MM-DD)', 'treatmentEndDate')}
                    {field('Hospital', 'hospital')}
                    <View style={styles.formField}>
                        <Text style={styles.formLabel}>Género</Text>
                        <View style={styles.genderRow}>
                            {['male', 'female', 'other'].map(g => (
                                <Pressable
                                    key={g}
                                    style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
                                    onPress={() => setForm(f => ({ ...f, gender: g }))}
                                >
                                    <Text style={[styles.genderBtnText, form.gender === g && styles.genderBtnTextActive]}>
                                        {GENDER_LABEL[g]}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

// ─── Adherencia ───────────────────────────────────────────────────────────────
const SEMAPHORE_COLOR = {
    green: '#2D9E75',
    yellow: '#E07B54',
    red: '#E74C3C',
};
const SEMAPHORE_LABEL = {
    green: 'Buena adherencia',
    yellow: 'Adherencia moderada',
    red: 'Baja adherencia',
};

function AdherenceCard({
    adherence,
}: { adherence: DashboardData['adherence'] }) {
    const color = SEMAPHORE_COLOR[adherence.status];
    const label = SEMAPHORE_LABEL[adherence.status];

    return (
        <Card>
            <View style={styles.adherenceRow}>
                {/* Semáforo */}
                <View style={styles.semaphore}>
                    {(['green', 'yellow', 'red'] as const).map(s => (
                        <View
                            key={s}
                            style={[
                                styles.semaphoreLight,
                                {
                                    backgroundColor:
                                        adherence.status === s
                                            ? SEMAPHORE_COLOR[s]
                                            : '#E0E0E0',
                                    transform: adherence.status === s
                                        ? [{ scale: 1.15 }]
                                        : [{ scale: 1 }],
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.adherenceLabel, { color }]}>{label}</Text>
                    <Text style={styles.adherenceDetail}>
                        {adherence.completed} de {adherence.planned} días este mes
                    </Text>
                </View>

                {/* Porcentaje */}
                <Text style={[styles.adherencePct, { color }]}>
                    {adherence.pct}%
                </Text>
            </View>

            {/* Barra de progreso */}
            <View style={styles.progressBg}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${adherence.pct}%`, backgroundColor: color },
                    ]}
                />
            </View>
            <Text style={[styles.chartNote, { marginTop: 6 }]}>
                Meta recomendada: 70% de los días hábiles
            </Text>
        </Card>
    );
}

// ─── Notas del supervisor ─────────────────────────────────────────────────────
function NotesSection({
    notes,
    onAdd,
    onDelete,
}: {
    notes: DashboardData['notes'];
    onAdd: (content: string) => Promise<void>;
    onDelete: (date: string) => Promise<void>;
}) {
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!text.trim()) return;
        setSaving(true);
        try {
            await onAdd(text.trim());
            setText('');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (date: string) => {
        setDeletingId(date);
        try {
            await onDelete(date);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <View>
            {/* Input nueva nota */}
            <Card style={{ marginBottom: 10 }}>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Añadir observación (ej: tuvo náuseas, faltó por revisión...)"
                    placeholderTextColor="#aaa"
                    value={text}
                    onChangeText={setText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
                <Pressable
                    style={({ pressed }) => [
                        styles.noteAddBtn,
                        (!text.trim() || saving) && styles.noteAddBtnDisabled,
                        pressed && { opacity: 0.8 },
                    ]}
                    onPress={handleAdd}
                    disabled={!text.trim() || saving}
                >
                    {saving
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <>
                            <MaterialIcons name="add" size={18} color="#fff" />
                            <Text style={styles.noteAddBtnText}>Añadir nota</Text>
                        </>
                    }
                </Pressable>
            </Card>

            {/* Lista de notas */}
            {notes.length === 0 ? (
                <Card>
                    <Text style={styles.emptyText}>Sin observaciones registradas</Text>
                </Card>
            ) : (
                notes.map(note => (
                    <Card key={note.date} style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                            <Text style={styles.noteDate}>
                                {new Date(note.date).toLocaleDateString('es-ES', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </Text>
                            <Pressable
                                onPress={() => handleDelete(note.date)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                {deletingId === note.date
                                    ? <ActivityIndicator size="small" color="#E74C3C" />
                                    : <MaterialIcons name="delete-outline" size={18} color="#E74C3C" />
                                }
                            </Pressable>
                        </View>
                        <Text style={styles.noteContent}>{note.content}</Text>
                    </Card>
                ))
            )}
        </View>
    );
}

// ─── pantalla principal ──────────────────────────────────────────────────────

export default function ParentalDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [userId, setUserId] = useState<number>(0);
    const [exporting, setExporting] = useState(false);
    useEffect(() => { loadDashboard(); }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const [d, me] = await Promise.all([
                clinicalProfileService.getDashboard(),
                api.get('/user/me'),
            ]);
            setData(d);
            setUserId(me.data.id);
        } catch (e) {
            Alert.alert('Error', 'No se pudo cargar el dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (formData: any) => {
        await clinicalProfileService.updateProfile(formData);
        await loadDashboard();
    };

    const handleExport = async () => {
        if (!data) return;
        setExporting(true);
        try {
            await exportDashboardPDF(data, userId);
        } catch (e) {
            console.error('PDF error:', e);
            Alert.alert('Error', 'No se pudo generar el PDF');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6B5B95" />
            </View>
        </SafeAreaView>
    );

    if (!data) return null;

    const { profile, stats, steps, sessions, wellness } = data;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>Panel parental</Text>
                <View style={{ width: 44 }} />
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.exportBtn,
                    pressed && { opacity: 0.8 },
                    exporting && { opacity: 0.6 },
                ]}
                onPress={handleExport}
                disabled={exporting || !data}
            >
                {exporting ? (
                    <ActivityIndicator size="small" color="#6B5B95" />
                ) : (
                    <>
                        <MaterialIcons name="picture-as-pdf" size={18} color="#6B5B95" />
                        <Text style={styles.exportBtnText}>Exportar informe PDF</Text>
                    </>
                )}
            </Pressable>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Cabecera usuario */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitials}>
                            {profile ? 'P' : '?'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.profileName}>ID {/* puedes poner nombre si lo tienes */}</Text>
                        <Text style={styles.profileSub}>
                            {profile ? `${profile.age} años · ${GENDER_LABEL[profile.gender] ?? profile.gender}` : 'Sin perfil clínico'}
                        </Text>
                    </View>
                    {profile?.diagnosis && (
                        <View style={styles.diagnosisBadge}>
                            <Text style={styles.diagnosisBadgeText}>{profile.diagnosis}</Text>
                        </View>
                    )}
                </View>

                {/* Métricas rápidas */}
                <View style={styles.metricsGrid}>
                    <MetricCard icon="local-fire-department" label="Racha" value={`${stats.streak} días`} valueColor="#E07B54" />
                    <MetricCard icon="directions-walk" label="Pasos hoy" value={stats.todaySteps.toLocaleString()} />
                    <MetricCard icon="fitness-center" label="Sesiones mes" value={`${stats.sessionsThisMonth}`} />
                    <MetricCard icon="stars" label="FP totales" value="—" valueColor="#534AB7" />
                </View>

                {/* Datos clínicos */}
                <View style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <SectionTitle icon="person" label="Datos clínicos" />
                        <Pressable style={styles.editBtn} onPress={() => setShowEdit(true)}>
                            <MaterialIcons name="edit" size={14} color="#6B5B95" />
                            <Text style={styles.editBtnText}>Editar</Text>
                        </Pressable>
                    </View>
                    {profile ? (
                        <Card>
                            <DataRow icon="straighten" label="Altura" value={`${profile.height} cm`} />
                            <DataRow icon="monitor-weight" label="Peso" value={`${profile.weight} kg`} />
                            <DataRow icon="event" label="Nacimiento" value={new Date(profile.birthDate).toLocaleDateString('es-ES')} />
                            <DataRow icon="local-hospital" label="Hospital" value={profile.hospital} />
                            <DataRow icon="event-available" label="Fin tratamiento" value={new Date(profile.treatmentEndDate).toLocaleDateString('es-ES')} />
                        </Card>
                    ) : (
                        <Card>
                            <Pressable style={styles.addProfileBtn} onPress={() => setShowEdit(true)}>
                                <MaterialIcons name="add-circle-outline" size={20} color="#6B5B95" />
                                <Text style={styles.addProfileText}>Añadir datos clínicos</Text>
                            </Pressable>
                        </Card>
                    )}
                </View>

                {/* Pasos diarios */}
                <View style={styles.section}>
                    <SectionTitle icon="bar-chart" label="Pasos diarios — últimas 2 semanas" />
                    <StepsChart steps={steps} />
                </View>

                {/* Racha semanal */}
                <View style={styles.section}>
                    <SectionTitle icon="calendar-today" label="Racha semanal" />
                    <StreakRow streak={stats.streak} />
                </View>

                {/* Sesiones por categoría */}
                <View style={styles.section}>
                    <SectionTitle icon="directions-run" label="Sesiones por tipo — último mes" />
                    <SessionsChart sessions={sessions} />
                </View>

                {/* Bienestar */}
                <View style={styles.section}>
                    <SectionTitle icon="mood" label="Bienestar medio — últimas 4 semanas" />
                    {wellness
                        ? <WellnessCards wellness={wellness} />
                        : <Card><Text style={styles.emptyText}>Sin datos de bienestar</Text></Card>
                    }
                </View>

                {/* Adherencia */}
                <View style={styles.section}>
                    <SectionTitle icon="event-available" label="Adherencia al programa — este mes" />
                    <AdherenceCard adherence={data.adherence} />
                </View>

                {/* Notas */}
                <View style={styles.section}>
                    <SectionTitle icon="note-alt" label="Notas del supervisor" />
                    <NotesSection
                        notes={data.notes}
                        onAdd={async (content) => {
                            await clinicalProfileService.addNote(content);
                            await loadDashboard();
                        }}
                        onDelete={async (date) => {
                            await clinicalProfileService.deleteNote(date);
                            await loadDashboard();
                        }}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <EditProfileModal
                visible={showEdit}
                initial={profile}
                onClose={() => setShowEdit(false)}
                onSave={handleSaveProfile}
            />
        </SafeAreaView>
    );
}

// ─── estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F3FF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8, borderRadius: 12,
        minWidth: 44, minHeight: 44,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: {
        flex: 1, fontSize: 18, fontWeight: '600',
        color: '#2D3E50', textAlign: 'center',
    },
    scroll: { flex: 1 },
    scrollContent: {
        padding: 16,
        alignSelf: 'center',
        width: '100%',
        maxWidth: CONTENT_WIDTH,
    },

    // Perfil header
    profileHeader: {
        flexDirection: 'row', alignItems: 'center',
        gap: 12, marginBottom: 16,
    },
    avatarCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#E8E5FF',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarInitials: { fontSize: 20, fontWeight: '500', color: '#534AB7' },
    profileName: { fontSize: 16, fontWeight: '600', color: '#2D3E50' },
    profileSub: { fontSize: 13, color: '#888', marginTop: 2 },
    diagnosisBadge: {
        backgroundColor: '#FFF3CD', borderRadius: 12,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    diagnosisBadgeText: { fontSize: 11, fontWeight: '600', color: '#8B6914' },

    // Métricas
    metricsGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: 8, marginBottom: 20,
    },
    metricCard: {
        flex: 1, minWidth: '45%',
        backgroundColor: '#fff',
        borderRadius: 12, padding: 12,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },
    metricLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
    metricValue: { fontSize: 20, fontWeight: '500', color: '#2D3E50' },

    // Secciones
    section: { marginBottom: 20 },
    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
    sectionTitleText: { fontSize: 11, fontWeight: '500', color: '#888', letterSpacing: 0.5 },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    editBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F0EDFF', borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    editBtnText: { fontSize: 12, color: '#6B5B95', fontWeight: '500' },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 14, padding: 14,
        borderWidth: 0.5, borderColor: '#E0E0E0',
    },

    // Gráfico barras
    chartContainer: {
        flexDirection: 'row', height: 80,
        alignItems: 'flex-end', gap: 4, paddingBottom: 2,
    },
    barWrapper: { flex: 1, alignItems: 'center', gap: 3 },
    barTrack: {
        flex: 1, width: '100%',
        justifyContent: 'flex-end',
    },
    barFill: { width: '100%', borderRadius: 3, minHeight: 3 },
    barLabel: { fontSize: 9, color: '#aaa' },
    chartFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    chartNote: { fontSize: 11, color: '#aaa' },

    // Progreso categorías
    progressRow: { marginBottom: 12 },
    progressRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { fontSize: 13, color: '#2D3E50' },
    progressCount: { fontSize: 13, fontWeight: '500' },
    progressBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },

    // Wellness
    wellnessGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    wellnessItem: { alignItems: 'center', gap: 2 },
    wellnessLabel: { fontSize: 11, color: '#888' },
    wellnessValue: { fontSize: 22, fontWeight: '500' },
    wellnessTrend: { fontSize: 10 },

    // Racha
    streakDays: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    streakDay: {
        width: 32, height: 32, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
    },
    streakDayFilled: { backgroundColor: '#534AB7' },
    streakDayEmpty: { backgroundColor: '#F0F0F0' },
    streakDayText: { fontSize: 12, fontWeight: '500', color: '#aaa' },
    streakDayTextFilled: { color: '#fff' },

    // DataRow
    dataRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
    },
    dataRowLabel: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    dataRowLabelText: { fontSize: 13, color: '#888' },
    dataRowValue: { fontSize: 13, fontWeight: '500', color: '#2D3E50' },

    // Empty
    emptyText: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 8 },
    addProfileBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 12,
    },
    addProfileText: { fontSize: 14, color: '#6B5B95', fontWeight: '500' },

    // Modal edición
    modalSafe: { flex: 1, backgroundColor: '#F5F3FF' },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0',
    },
    modalTitle: { fontSize: 16, fontWeight: '600', color: '#2D3E50' },
    modalSave: { fontSize: 15, fontWeight: '600', color: '#6B5B95' },
    modalScroll: { flex: 1 },
    formField: { marginBottom: 16 },
    formLabel: { fontSize: 12, color: '#888', marginBottom: 6, fontWeight: '500' },
    formInput: {
        backgroundColor: '#fff', borderRadius: 10,
        borderWidth: 0.5, borderColor: '#E0E0E0',
        padding: 12, fontSize: 15, color: '#2D3E50',
    },
    genderRow: { flexDirection: 'row', gap: 8 },
    genderBtn: {
        flex: 1, padding: 10, borderRadius: 10,
        borderWidth: 0.5, borderColor: '#E0E0E0',
        alignItems: 'center', backgroundColor: '#fff',
    },
    genderBtnActive: { borderColor: '#6B5B95', backgroundColor: '#F0EDFF' },
    genderBtnText: { fontSize: 13, color: '#888' },
    genderBtnTextActive: { color: '#6B5B95', fontWeight: '600' },

    // adherencia
    adherenceRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
    },
    semaphore: {
        flexDirection: 'column', gap: 4, alignItems: 'center',
        backgroundColor: '#222', borderRadius: 12, padding: 6,
    },
    semaphoreLight: {
        width: 16, height: 16, borderRadius: 8,
    },
    adherenceLabel: { fontSize: 14, fontWeight: '500' },
    adherenceDetail: { fontSize: 12, color: '#888', marginTop: 2 },
    adherencePct: { fontSize: 26, fontWeight: '500' },

    // notas
    noteInput: {
        fontSize: 14, color: '#2D3E50',
        minHeight: 70, marginBottom: 10,
        paddingTop: 4,
    },
    noteAddBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, backgroundColor: '#6B5B95', borderRadius: 10,
        paddingVertical: 10, paddingHorizontal: 16,
    },
    noteAddBtnDisabled: { backgroundColor: '#C4B8E8' },
    noteAddBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    noteCard: { marginBottom: 8 },
    noteHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 6,
    },
    noteDate: { fontSize: 11, color: '#aaa' },
    noteContent: { fontSize: 14, color: '#2D3E50', lineHeight: 20 },

    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 6,
        marginBottom: 2,
        backgroundColor: '#F0EDFF',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 0.5,
        borderColor: '#C4B8E8',
        minHeight: 44,
    },
    exportBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B5B95',
    },
});
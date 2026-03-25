import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { UserService } from '@/services/userService';

interface UserData {
    id: number;
    streak: number;
    todaySteps: number;
}

export default function ParentalDashboard() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener datos del usuario autenticado
            const token = await authService.getAccessToken();
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const user = await response.json();

            // Obtener datos adicionales (streak y steps de hoy)
            const streak = await UserService.getStreak();
            const todaySteps = await UserService.getStepCount();

            setUserData({
                ...user,
                streak,
                todaySteps,
            });
        } catch (err) {
            console.error('Error loading user data:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar datos del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            router.replace('/login');
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6B5B95" />
                    <Text style={styles.loadingText}>Cargando datos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
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
                    <Text style={styles.headerTitle}>Panel Parental</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.centerContainer}>
                    <MaterialIcons name="error-outline" size={64} color="#E74C3C" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable 
                        style={({ pressed }) => [
                            styles.retryButton,
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={loadUserData}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }
    
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
                <Text style={styles.headerTitle}>Panel Parental</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* Sección de bienvenida */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>
                        Usuario ID: {userData?.id}
                    </Text>
                </View>

                {/* Tarjeta de perfil */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="person" size={32} color="#6B5B95" />
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle}>Información General</Text>
                            <Text style={styles.cardSubtitle}>Datos de la cuenta</Text>
                        </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>ID de usuario:</Text>
                        <Text style={styles.infoValue}>{userData?.id}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Racha actual:</Text>
                        <Text style={styles.infoValue}>{userData?.streak} días</Text>
                    </View>
                </View>

                {/* Tarjeta de actividad */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="directions-run" size={32} color="#57EA94" />
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle}>Actividad Física</Text>
                            <Text style={styles.cardSubtitle}>Datos de hoy</Text>
                        </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{userData?.todaySteps}</Text>
                            <Text style={styles.statLabel}>Pasos hoy</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{userData?.streak}</Text>
                            <Text style={styles.statLabel}>Racha de días</Text>
                        </View>
                    </View>
                </View>

                {/* Tarjeta de acciones */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Acciones</Text>
                    <View style={styles.cardDivider} />

                    <Pressable 
                        style={({ pressed }) => [
                            styles.actionButton,
                            pressed && styles.actionButtonPressed,
                        ]}
                        onPress={() => {
                            // Aquí puedes agregar más funcionalidades
                            // Por ejemplo: ver historial de ejercicios, reportes, etc.
                        }}
                    >
                        <MaterialIcons name="history" size={24} color="#6B5B95" />
                        <Text style={styles.actionButtonText}>Ver Historial</Text>
                    </Pressable>

                    <Pressable 
                        style={({ pressed }) => [
                            styles.actionButton,
                            pressed && styles.actionButtonPressed,
                        ]}
                        onPress={() => {
                            // Agregar más funcionalidades aquí
                        }}
                    >
                        <MaterialIcons name="assessment" size={24} color="#6B5B95" />
                        <Text style={styles.actionButtonText}>Ver Reportes</Text>
                    </Pressable>
                </View>

                {/* Botón de logout */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.logoutButton,
                        pressed && styles.logoutButtonPressed,
                    ]}
                    onPress={handleLogout}
                >
                    <MaterialIcons name="logout" size={24} color="#fff" />
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </Pressable>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#F0F8FF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 12,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: '#2D3E50',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 44,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7D8F',
        marginTop: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#E74C3C',
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: '#6B5B95',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    welcomeSection: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: '700',
        color: '#2D3E50',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardHeaderText: {
        marginLeft: 12,
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3E50',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#9B9B9B',
        marginTop: 2,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7D8F',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D3E50',
        flex: 1,
        textAlign: 'right',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#F5F9FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E8F7',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#57EA94',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7D8F',
        marginTop: 8,
        fontWeight: '500',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#F5F9FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E8F7',
    },
    actionButtonPressed: {
        backgroundColor: '#EAF0FB',
        opacity: 0.8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B5B95',
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#E74C3C',
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 16,
        gap: 8,
    },
    logoutButtonPressed: {
        opacity: 0.8,
        backgroundColor: '#C0392B',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSpacing: {
        height: 20,
    },
});

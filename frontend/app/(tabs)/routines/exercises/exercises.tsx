import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Exercises() {
    const router = useRouter();
    const { sessionId } = useLocalSearchParams();

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

            <Text style={styles.mainTitle}>Título del ejercicio</Text>

            {/* Audiovisual */}
            <View style={styles.container}>
                <Text style={styles.placeholder}>[Aquí se mostraría el video o imagen del ejercicio]</Text>
            </View>

             {/* Repeticiones y series */}
             <View style={styles.container}>
                <Text style={styles.placeholder}>[Aquí se mostrarían las repeticiones y series recomendadas]</Text>
            </View>

            {/* Material necesario */}
            <View style={styles.container}>
                <Text style={styles.placeholder}>[Aquí se mostraría el material necesario para el ejercicio]</Text>
            </View>

             {/* Descripción */}
             <View style={styles.container}>
                <Text style={styles.placeholder}>[Aquí se mostraría la descripción detallada del ejercicio]</Text>
            </View>

            {/* Botón Siguiente */}
                <Pressable 
                style={({ pressed }) => [
                    styles.nextButton,
                    pressed && styles.nextButtonPressed,
                ]}
                //onPress={handleNext}
            >
                <MaterialIcons name="arrow-forward" size={28} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: 'lightcyan',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
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
    mainTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2D3E50',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 28,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        fontSize: 16,
        color: '#999',
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
    nextButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});
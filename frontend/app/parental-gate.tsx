import { authService } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View, StyleSheet, TextInput, Pressable, Text } from "react-native";

interface ParentalGateModalProps {
    onClose: () => void;
}

export function ParentalGateModal({ onClose }: ParentalGateModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerifyPassword = async () => {
        if(!password.trim()) {
            Alert.alert('Error', 'Please, enter a password.');
            return;
        }

        setLoading(true);
        try{
            // TODO: Verificar contraseña con backend (endpoint específico para supervisores)
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/verify-parental`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await authService.getAccessToken()}` // Asegúrate de tener el token de acceso para autenticar la solicitud
                },
                body: JSON.stringify({ password }),
            });

            if(!response.ok) {
                Alert.alert('Error', 'Wrong password. Please try again.');
                return;
            }

            // Contraseña correcta -> Ir a panel de supervisión
            onClose();
            router.push('/parental-gate');
        } catch (error) {
            Alert.alert('Error', 'An error occurred while verifying the password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Confirm Logout', 'Are you sure you want to log out?', 
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: async () => {
                    await authService.logout();
                    router.replace('/login');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.modal}>
                {/* Boton cerrar */}
                <Pressable style={styles.closeButton} onPress={onClose}>
                    <MaterialIcons name="close" size={28} color="#6B5B95" />
                </Pressable>

                {/* Icono de candado */}
                <MaterialIcons name="lock" size={48} color="#6B5B95" style={styles.lockIcon} />
                <Text style={styles.modalTitle}>Parental Gate</Text>
                <Text style={styles.modalSubtitle}>Please enter the parental password to access the dashboard.</Text>

                {/* Input de contraseña */}
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Parental Password"
                    placeholderTextColor={'#999'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoFocus
                />

                {/* Botón de verificación */}
                <Pressable
                    style={({ pressed }) => [
                        styles.verifyButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleVerifyPassword}
                    disabled={loading}
                >
                    <Text style={styles.verifyButtonText}>{loading ? 'Verifying...' : 'Access'}</Text>
                </Pressable>

                {/* Información de futuras características */}
                <View style={styles.futureFeatures}>
                    <Text style={styles.futureFeaturesTitle}>Future Features:</Text>
                    <Text style={styles.featureText}>- View child's medical history</Text>
                    <Text style={styles.featureText}>- Medical configuration </Text>
                    <Text style={styles.featureText}>- View child's progress</Text>
                </View>

                {/* Botón de cierre de sesión */}
                <Pressable
                    style={({ pressed }) => [
                        styles.logoutButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleLogout}
                >
                    <MaterialIcons name="logout" size={20} color="#FF6B6B" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  lockIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B5B95',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  passwordInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  verifyButton: {
    backgroundColor: '#6B5B95',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 52,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  futureFeatures: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  futureFeaturesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B5B95',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 14,
    minHeight: 52,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
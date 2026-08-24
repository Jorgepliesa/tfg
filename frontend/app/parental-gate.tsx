import { authService } from "@/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View, StyleSheet, TextInput, Pressable, Text, Platform, Modal } from "react-native";

interface ParentalGateModalProps {
  onClose: () => void;
}

export function ParentalGateModal({ onClose }: ParentalGateModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please, enter a password.');
      return;
    }

    setLoading(true);
    try {
      // TODO: Verificar contraseña con backend (endpoint específico para supervisores)
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/verify-parental`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await authService.getAccessToken()}` // Asegúrate de tener el token de acceso para autenticar la solicitud
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!data.valid) {
        Alert.alert('Error', 'Contraseña incorrecta. Pruebe de nuevo.');
        return;
      }

      // Contraseña correcta -> Ir a panel de supervisión
      onClose();
      router.push('/parental-dashboard');
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error al verificar la contraseña. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      setShowLogoutConfirm(true);
    }
    else {
      Alert.alert('Confirmar cierre de sesión', '¿Estás seguro de que quieres cerrar la sesión?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar sesión', style: 'destructive', onPress: confirmLogout },
        ]
      );
    }
  };

  const confirmLogout = async () => {
    await authService.logout();
    onClose();
    router.replace('/login');
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
        <Text style={styles.modalTitle}>Control Parental</Text>
        <Text style={styles.modalSubtitle}>Por favor, introduzca la contraseña para acceder al panel de información. </Text>

        {/* Input de contraseña */}
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña de supervisor"
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
          <Text style={styles.verifyButtonText}>{loading ? 'Verificando...' : 'Acceder'}</Text>
        </Pressable>

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

      {/* Modal confirmación logout en web */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirmar cierre de sesión</Text>
            <Text style={styles.confirmMessage}>¿Estás seguro de que quieres cerrar la sesión?</Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmLogoutButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  setShowLogoutConfirm(false);
                  confirmLogout();
                }}
              >
                <Text style={styles.confirmLogoutButtonText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  // Estilos del modal de confirmación
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    elevation: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmLogoutButton: {
    backgroundColor: '#FF6B6B',
  },
  confirmLogoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
import { router } from "expo-router";
import { useState } from "react";
import { ImageBackground, Modal, Pressable, View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { ParentalGateModal } from "./parental-gate";

export default function WelcomeScreen() {
    const [showParentalGate, setShowParentalGate] = useState(false);

    const handleEnter = () => {
        router.replace('/(tabs)');
    };

    return (
        <ImageBackground
            source={require('@/assets/images/Welcome.png')}
            style={styles.container}
            resizeMode = "cover"
        >
            {/* Logo y titulo */}
            <View style={styles.logoContainer}>
                <Text style={styles.logo}>🏃‍♂️</Text>
                <Text style={styles.title}>Health Game</Text>
                <Text style={styles.subtitle}>¡Muévete y diviértete!</Text>
            </View>

            {/* Botón de entrada */}
            <Pressable
                style={({ pressed }) => [
                    styles.enterButton,
                    pressed && styles.buttonPressed,
                ]}
                onPress={handleEnter}
            >
                <Text style={styles.enterButtonText}>Entrar</Text>
                <MaterialIcons name="arrow-forward" size={28} color="#fff" />
            </Pressable>

            {/* Boton Parental Gate */}
            <Pressable
                style={({ pressed }) => [
                    styles.parentalButton,
                    pressed && styles.buttonPressed,
                ]}
                onPress={() => setShowParentalGate(true)}
            >
                <MaterialIcons name="supervisor-account" size={32} color="#6B5B95" />
                <Text style={styles.parentalButtonText}>Padres</Text>
            </Pressable>

            {/* Modal Parental Gate */}
            <Modal
                visible={showParentalGate}
                transparent
                animationType="fade"
                onRequestClose={() => setShowParentalGate(false)}
            >
                <ParentalGateModal onClose={() => setShowParentalGate(false)} />
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#B4E7CE',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        fontSize: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FF6B6B',
        textShadowColor: 'rgba(255,255,255,0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 20,
        color: '#6B5B95',
        marginTop: 8,
        fontWeight: '600',
    },
    enterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF6B6B',
        paddingVertical: 20,
        paddingHorizontal: 48,
        borderRadius: 30,
        elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            minWidth: 200,
            minHeight: 60,
        },
        enterButtonText: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#fff',
            marginRight: 12,
        },
        buttonPressed: {
            opacity: 0.7,
            transform: [{ scale: 0.95 }],
        },
        parentalButton: {
            position: 'absolute',
            bottom: 40,
            left: 30,
            alignItems: 'center',
            backgroundColor: '#FFE5B4',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 20,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            minWidth: 100,
            minHeight: 60,
        },
        parentalButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#6B5B95',
            marginTop: 4,
        },
        });
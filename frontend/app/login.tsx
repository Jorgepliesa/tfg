import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { authService } from "@/services/authService";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, TextInput, StyleSheet } from "react-native";

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if(!username.trim() || !password.trim()) {
            Alert.alert('Error', 'Please complete all fields');
            return;
        }

        setLoading(true);
        try {
            await authService.login(username, password);
            // Redirigir a la pantalla principal
            router.replace('/(tabs)'); // TODO: /home?
        } catch (error) {
            Alert.alert('Login Failed', 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
                Welcome!
            </ThemedText>

            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
            />

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <ThemedText style={styles.buttonText}>Login</ThemedText>
                )}
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 32,
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        minHeight: 44,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
import { authService } from "@/services/authService";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  useEffect(() => {
    if (isAuthenticated === null) return; // Esperar a que se determine el estado de autenticación

    const inAuthGroup = segments[0] === '(tabs)';

    if(!isAuthenticated && inAuthGroup) {
      // Usuario no autenticado intentando acceder a rutas protegidas
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // Usuario autenticado en login -> redirigir a home
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  if (isAuthenticated === null) {
    return null; // O un splash screen/loading indicator TODO: implementar pantalla de carga mientras se verifica la autenticación
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}


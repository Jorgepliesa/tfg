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

  // Re-check auth cuando cambian los segmentos (ej: después de login)
  useEffect(() => {
    if (segments[0] === 'welcome' || segments[0] === '(tabs)') {
      checkAuth();
    }
  }, [segments]);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  useEffect(() => {
    if (isAuthenticated === null) return; // Esperar a que se determine el estado de autenticación

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'welcome'; // Rutas protegidas

    if(!isAuthenticated && inAuthGroup) { 
      router.replace('/login');
    } 
    else if (isAuthenticated && segments[0] === 'login') {
      router.replace('/welcome');
    }
  }, [isAuthenticated, segments]);

  if (isAuthenticated === null) {
    return null; // TODO: Splash screen con logo
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="parental-dashboard"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Parental Dashboard',
        }}
      />
    </Stack>
  );
}


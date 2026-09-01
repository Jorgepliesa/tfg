import { authService } from "@/services/authService";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SessionProvider } from "@/context/SessionContext";
import '../i18n'; // <-- Configuración de internacionalización i18next
import * as Updates from 'expo-updates';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) return; // no hacer esto en desarrollo local

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // recarga la app YA con el nuevo bundle
        }
      } catch (e) {
        console.log('Error buscando updates:', e);
      }
    }

    checkForUpdates();
  }, []);

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

    if (!isAuthenticated && inAuthGroup) {
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
    <SessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="welcome" />
        <Stack.Screen
          name="parental-dashboard"
          options={{
            headerShown: false,
            title: 'Parental Dashboard',
          }}
        />
      </Stack>
    </SessionProvider>
  );
}


import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authService } from './authService';

// Usar el mismo storage que authService (SecureStore en móvil, localStorage en web)
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.32:3000',
  timeout: 10000,
});

// URL base del backend — usar para construir URLs de imágenes estáticas
export const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.32:3000';


// Flag para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error);
  }
  return config;
});

// Interceptor para manejar 401 (token expirado) y errores de red
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Manejo de errores de red
    if (!error.response) {
      console.error('❌ Network error (sin respuesta del servidor):', error.message);
      console.log('Posibles causas: Backend no está corriendo, sin conexión a internet, CORS error');
      return Promise.reject(new Error('Network error: No response from server'));
    }

    // Manejo de token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya hay un refresh en progreso, esperar a que termine
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('⚠️ Access token expirado, intentando refresh...');

      try {
        const newToken = await authService.refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log('✅ Token refrescado, reintentando request...');
        isRefreshing = false;
        onRefreshed(newToken);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed, logging out:', refreshError);
        isRefreshing = false;
        await authService.logout();
        // Redirigir a login si es necesario (esto se maneja en _layout.tsx)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/*
// ==================== EJERCICIOS EJECUTADOS ====================

export const executeApi = {
  createExecute: (data: {
    exercise: string;
    numRepsDone: number;
    tInitial: string; // ISO date string
    tFinal: string;   // ISO date string
  }) =>
    api.post('/execute/create', data),

  getSessionExecutes: (sessionDate: string) =>
    api.get(`/execute/session/${sessionDate}`),

  getExecute: (exerciseName: string) =>
    api.get(`/execute/${exerciseName}`),
};*/

export default api;
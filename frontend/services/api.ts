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
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
});

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

// Interceptor para manejar 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed, logging out');
        await authService.logout();
        // Redirigir a login si es necesario
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
  };
}

// Adaptador de almacenamiento: SecureStore para móvil (encriptado), localStorage para web
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: LoginResponse = await response.json();

    // Guardar tokens de forma segura
    await storage.setItem('accessToken', data.accessToken);
    await storage.setItem('refreshToken', data.refreshToken);
    await storage.setItem('userId', data.user.id.toString());

    return data;
  },

  async logout(): Promise<void> {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    await storage.removeItem('userId');
  },

  async getAccessToken(): Promise<string | null> {
    return await storage.getItem('accessToken');
  },

  async getRefreshToken(): Promise<string | null> {
    return await storage.getItem('refreshToken');
  },

  async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${refreshToken}` 
      },
    });

    if (!response.ok) {
        // Refresh token invalido -> forzar re-login
        await this.logout();
        throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    await storage.setItem('accessToken', data.accessToken);

    return data.accessToken;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },
};
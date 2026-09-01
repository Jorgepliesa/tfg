import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
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
  async login(id: number, password: string): Promise<LoginResponse> {
    console.log(' Making request to:', `${API_URL}/auth/login`);
    console.log(' Payload:', { id, password: '***' });

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });

      console.log(' Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Login failed: ${response.status} - ${errorText}`);
      }

      const data: LoginResponse = await response.json();
      console.log('✅ Login response received:', {
        userId: data.user.id,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken
      });

      // Guardar tokens de forma segura
      await storage.setItem('accessToken', data.accessToken);
      await storage.setItem('refreshToken', data.refreshToken);
      await storage.setItem('userId', data.user.id.toString());

      console.log(' Tokens saved successfully');

      // Verificar que se guardaron
      const savedToken = await storage.getItem('accessToken');
      console.log('✅ Token verification:', { tokenSaved: !!savedToken });

      return data;
    } catch (error: any) {
      console.error('❌ Network/fetch error:', error);
      throw new Error(error.message || 'Network error - check if backend is running');
    }
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

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh token inválido -> forzar re-login
        await this.logout();
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      await storage.setItem('accessToken', data.accessToken);
      console.log('✅ Access token refreshed successfully');

      return data.accessToken;
    } catch (error: any) {
      console.error('❌ Error refreshing token:', error);
      await this.logout();
      throw new Error(error.message || 'Token refresh failed');
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    const isAuth = !!token;
    console.log(' isAuthenticated check:', { hasToken: isAuth, tokenPreview: token?.substring(0, 20) });
    return isAuth;
  },
};
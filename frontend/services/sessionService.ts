import api from './api';

export const sessionService = {
  async canStartSession(): Promise<{ canStart: boolean }> {
    try {
      const response = await api.get('/session/can-start');
      return response.data;
    } catch (error) {
      console.error('Error checking if session can start:', error);
      throw error;
    }
  },

  async startSession(data: { routine: string; isCoop: boolean }) : Promise<{ date: string; userId: number; duration: number; routine: string; isCoop: boolean }> {
    try {
      const response = await api.post('/session/start', data);
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },
  
  async getCurrentSession() : Promise<{ date: string; userId: number; duration: number; routine: string; isCoop: boolean } | null> {
    try {
      const response = await api.get('/session/current');
      return response.data;
    } catch (error) {
      console.error('Error getting current session:', error);
      throw error;
    }
  },

  async endSession(duration: number) : Promise<{ date: string; userId: number; duration: number; routine: string; isCoop: boolean } | null> {
    try {
      const response = await api.patch('/session/end', { duration });
      return response.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },
};
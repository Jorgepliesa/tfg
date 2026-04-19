import api from './api';

export const wellnessTestService = {
  async createTest(data: {
    pain: number;
    sleepiness: number;
    mood: number;
    fatigue: number;
    type: 'initial' | 'final';
  }): Promise<void> {
    try {
      await api.post('/wellness-test/create', data);
    } catch (error) {
      console.error('Error creating wellness test:', error);
      throw error;
    }
  },

  async getMyTests(): Promise<void> {
    try {
      await api.get('/wellness-test/my-tests');
    } catch (error) {
      console.error('Error getting wellness tests:', error);
      throw error;
    }
  },
};
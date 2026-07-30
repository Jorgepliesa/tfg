import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const avatarService = {
    async getFitnessPoints(): Promise<number> {
        try {
            const response = await api.get('/user/fp');

            if (!response.data) throw new Error(`HTTP error! status: ${response.status}`);

            return response.data.fp;
        } catch (error) {
            console.error('Error getting fitness points:', error);
            throw error;
        }
    },
    async addFitnessPoints(amount: number): Promise<{ fp: number }> {
        try {
            const response = await api.patch('/avatar/add-fp', { amount });
            return response.data;
        } catch (error) {
            console.error('Error adding fitness points:', error);
            throw error;
        }
    }
};
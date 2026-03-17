import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export const UserService = {
    async getStreak(): Promise<number> {
        try {
            const response = await api.get('/user/streak');

            if (!response.data) throw new Error(`HTTP error! status: ${response.status}`);

            return response.data.streak;
        } catch (error) {
            console.error('Error getting user streak:', error);
            throw error;
        }
    },
    async getStepCount(): Promise<number> {
        try {
            const response = await api.get('/user/today-steps');

            if (!response.data) throw new Error(`HTTP error! status: ${response.status}`);

            return response.data.todaySteps;
        } catch (error) {
            console.error('Error getting step count:', error);
            throw error;
        }
    }
};
import api from './api';

export const omopSensorService = {
    async getTodaySteps(): Promise<number> {
        try {
            const response = await api.get('/sensors/today-steps');
            return response.data.todaySteps;
        } catch (error) {
            console.error('Error getting today steps from OMOP:', error);
            return 0;
        }
    },

    async getRecentSessionsSummary(limit = 10) {
        try {
            const response = await api.get('/sensors/recent-sessions-summary', { params: { limit } });
            return response.data;
        } catch (error) {
            console.error('Error getting recent sessions summary:', error);
            return [];
        }
    },
};
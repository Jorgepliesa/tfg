import api from './api';

export const executeService = {
    async createExecute(data: {
        exercise: string;
        numRepsDone: number;
        numSeriesDone: number;
        tInitial: string;
        tFinal: string;
    }) {
        const response = await api.post('/execute/create', data);
        return response.data;
    },
};
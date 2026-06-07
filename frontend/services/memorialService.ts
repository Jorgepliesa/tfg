import api from './api';

export const memorialService = {
    async getMemorials() {
        const response = await api.get('/memorial');
        return response.data;
    },
};
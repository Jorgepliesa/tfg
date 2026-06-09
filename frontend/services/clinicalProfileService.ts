import api from './api';

export const clinicalProfileService = {
    async getDashboard() {
        const response = await api.get('/clinical-profile/dashboard');
        return response.data;
    },
    async getProfile() {
        const response = await api.get('/clinical-profile');
        return response.data;
    },
    async updateProfile(data: Partial<{
        age: number; gender: string; height: number; weight: number;
        birthDate: string; diagnosis: string; treatmentEndDate: string; hospital: string;
    }>) {
        const response = await api.patch('/clinical-profile', data);
        return response.data;
    },

    async addNote(content: string) {
        const response = await api.post('/clinical-profile/notes', { content });
        return response.data;
    },
    async deleteNote(date: string) {
        await api.delete(`/clinical-profile/notes/${encodeURIComponent(date)}`);
    },
};
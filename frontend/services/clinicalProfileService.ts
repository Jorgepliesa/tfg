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
    async getContraindicationCatalog() {
        const response = await api.get('/clinical-profile/contraindications/catalog');
        return response.data;
    },
    async getContraindications() {
        const response = await api.get('/clinical-profile/contraindications');
        return response.data;
    },
    async updateContraindications(names: string[]) {
        const response = await api.patch('/clinical-profile/contraindications', { names });
        return response.data;
    },
    async getMoodTrend(limit = 14) {
        const response = await api.get('/clinical-profile/mood-trend', { params: { limit } });
        return response.data;
    },
    async getPrePostComparison(limit = 10) {
        const response = await api.get('/clinical-profile/pre-post-comparison', { params: { limit } });
        return response.data;
    },
};
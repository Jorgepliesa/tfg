import api from './api';
import { ExerciseInRoutineDto } from '../../backend/src/dtos/routine.dto';
export const routineService = {
  async getRoutineDetails(routineName: string): Promise<ExerciseInRoutineDto[]> {
    try {
      const response = await api.get(`/routine/${routineName}`);

      if (!response.data) throw new Error(`HTTP error! status: ${response.status}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching routine details:', error);
      throw error;
    }
  },

  async recommendRoutine(hasEquipment: boolean): Promise<{ routineName: string; category: string; difficulty: string }> {
    try {
      const response = await api.get('/routine/recommend', { params: { hasEquipment } });
      if (!response.data) throw new Error(`HTTP error! status: ${response.status}`);
      return response.data;
    } catch (error) {
      console.error('Error recommending routine:', error);
      throw error;
    }
  },

  async getExerciseCatalog() {
    const response = await api.get('/routine/exercises/catalog');
    return response.data;
  },
  async getMyRoutines(category?: string) {
    const response = await api.get('/routine/mine', { params: category ? { category } : {} });
    return response.data;
  },
  async getRoutineForEditing(routineName: string) {
    const response = await api.get(`/routine/${encodeURIComponent(routineName)}/edit-view`);
    return response.data;
  },
  async createRoutine(dto: { name: string; category: string; difficulty: string; exercises: any[] }) {
    const response = await api.post('/routine', dto);
    return response.data;
  },
  async forkRoutine(sourceRoutineName: string, dto: { newName: string; category?: string; difficulty?: string; exercises: any[] }) {
    const response = await api.post(`/routine/${encodeURIComponent(sourceRoutineName)}/fork`, dto);
    return response.data;
  },
  async deleteRoutine(routineName: string) {
    await api.delete(`/routine/${encodeURIComponent(routineName)}`);
  },
  async updateRoutine(routineName: string, dto: { category?: string; difficulty?: string; exercises: any[] }) {
    const response = await api.patch(`/routine/${encodeURIComponent(routineName)}`, dto);
    return response.data;
  },
};
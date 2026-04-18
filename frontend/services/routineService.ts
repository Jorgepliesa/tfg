import api from './api';
import { ExerciseInRoutineDto } from '../../backend/src/dtos/routine.dto';
export const routineService = {
  async suggestRoutine(category: string) : Promise<{ routineName: string; category: string; difficulty: string }> {
    try {
        const response = await api.get('/routine/suggest', { params: { category } });

        if(!response.data) throw new Error(`HTTP error! status: ${response.status}`);

        return response.data;
    } catch (error) {
        console.error('Error suggesting routine:', error);
        throw error;
    }
  },

  async getRoutineDetails(routineName: string) : Promise<ExerciseInRoutineDto[]> {
    try {
    const response = await api.get(`/routine/${routineName}`);

      if(!response.data) throw new Error(`HTTP error! status: ${response.status}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching routine details:', error);
      throw error;
    }
  },
};
import api from "./api";

export interface CoopChallengeData {
  name: string;
  startDate: string;
  endDate: string;
  totalSteps: number;
  currentSteps: number;
}

export const challengeService = {
  async getActiveChallenge(): Promise<CoopChallengeData> {
    const response = await api.get<CoopChallengeData>('/challenges/active');
    return response.data;
  },
};

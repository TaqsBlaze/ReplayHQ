import { Run } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  getRuns: async (): Promise<Run[]> => {
    const response = await fetch(`${API_BASE_URL}/runs`);
    if (!response.ok) {
      throw new Error('Failed to fetch runs');
    }
    return response.json();
  },

  getRun: async (id: string): Promise<Run> => {
    const response = await fetch(`${API_BASE_URL}/runs/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch run');
    }
    return response.json();
  },

  // Add more methods as needed (events, files, metrics, etc.)
};

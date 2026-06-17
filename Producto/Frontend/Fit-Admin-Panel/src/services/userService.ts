import api from './api';

export interface UserSummary {
  userId: string;
  fullName: string;
  email: string;
  role: string;
}

export const userService = {
  getSupervisors: async (): Promise<UserSummary[]> => {
    const { data } = await api.get<UserSummary[]>('/api/v1/admin/users');
    return data.filter(u => u.role === 'SUPERVISOR_OBRA');
  },
};

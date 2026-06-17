import api from './api';
import type { Project, CreateProjectData } from '../types/project';

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>('/api/v1/mobile/projects');
    return data;
  },

  getProjectById: async (projectId: string): Promise<Project> => {
    const { data } = await api.get<Project>(`/api/v1/mobile/projects/${projectId}`);
    return data;
  },

  createProject: async (payload: CreateProjectData): Promise<Project> => {
    const { data } = await api.post<Project>('/api/v1/mobile/projects', payload);
    return data;
  },
};

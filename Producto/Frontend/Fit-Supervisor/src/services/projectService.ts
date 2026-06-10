import api from './api'
import type { Project } from '../types/project'

export const getProjects = (): Promise<Project[]> =>
  api.get<Project[]>('/projects').then((r) => r.data)

export const getProject = (id: string): Promise<Project> =>
  api.get<Project>(`/projects/${id}`).then((r) => r.data)

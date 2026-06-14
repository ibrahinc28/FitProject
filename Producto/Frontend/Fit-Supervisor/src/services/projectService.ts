import api from './api'
import type { Project } from '../types/project'

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await api.get<Project[]>('/projects')
  return data
}

export const getProject = async (id: string): Promise<Project> => {
  const { data } = await api.get<Project>(`/projects/${id}`)
  return data
}

export interface CreateProjectInput {
  modelName: string
  description?: string
  imageUrl?: string
  budget?: number
}

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  const { data } = await api.post<Project>('/projects', input)
  return data
}

export interface UpdateProjectInput {
  description?: string
  imageUrl?: string
  budget?: number
}

export const updateProject = async (id: string, input: UpdateProjectInput): Promise<Project> => {
  const { data } = await api.patch<Project>(`/projects/${id}`, input)
  return data
}

import api from './api'
import type { ConstructionStep } from '../types/project'

export const createStep = async (projectId: string, stepName: string): Promise<ConstructionStep> => {
  const { data } = await api.post<ConstructionStep>('/steps', { projectId, stepName })
  return data
}

export const renameStep = async (stepId: string, stepName: string): Promise<ConstructionStep> => {
  const { data } = await api.post<ConstructionStep>(`/steps/${stepId}/name`, { stepName })
  return data
}

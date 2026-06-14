import api from './api'
import type { TaskAssignment, CreateAssignmentRequest } from '../types/assignment'

export const createAssignment = async (req: CreateAssignmentRequest): Promise<TaskAssignment> => {
  const { data } = await api.post<TaskAssignment>('/assignments', req)
  return data
}

export const getAssignmentsByWorker = async (workerId: string): Promise<TaskAssignment[]> => {
  const { data } = await api.get<TaskAssignment[]>(`/assignments/worker/${workerId}`)
  return data
}

export const getAssignmentsByStep = async (stepId: string): Promise<TaskAssignment[]> => {
  const { data } = await api.get<TaskAssignment[]>(`/assignments/step/${stepId}`)
  return data
}

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  await api.delete(`/assignments/${assignmentId}`)
}

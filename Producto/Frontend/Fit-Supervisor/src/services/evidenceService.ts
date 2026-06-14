import api from './api'
import type { Evidence, SubmitEvidenceRequest } from '../types/evidence'

export const getEvidenceByStep = async (stepId: string): Promise<Evidence[]> => {
  const { data } = await api.get<Evidence[]>(`/evidence/step/${stepId}`)
  return data
}

export const getPendingEvidences = async (): Promise<Evidence[]> => {
  const { data } = await api.get<Evidence[]>('/evidence/pending')
  return data
}

export const submitEvidence = async (req: SubmitEvidenceRequest): Promise<Evidence> => {
  const { data } = await api.post<Evidence>('/evidence', req)
  return data
}

export const approveEvidence = async (evidenceId: string, supervisorId: string): Promise<Evidence> => {
  const { data } = await api.post<Evidence>(`/evidence/${evidenceId}/approve`, {}, {
    params: { supervisorId },
  })
  return data
}

export const rejectEvidence = async (evidenceId: string, supervisorId: string): Promise<Evidence> => {
  const { data } = await api.post<Evidence>(`/evidence/${evidenceId}/reject`, {}, {
    params: { supervisorId },
  })
  return data
}

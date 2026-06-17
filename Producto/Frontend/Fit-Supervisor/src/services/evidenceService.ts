import api from './api'
import type { Evidence, SubmitEvidenceRequest } from '../types/evidence'

export const getEvidenceByStep = async (stepId: string): Promise<Evidence[]> => {
  const { data } = await api.get<Evidence[]>(`/evidence/step/${stepId}`)
  return data
}

export const getEvidenceByWorker = async (workerId: string): Promise<Evidence[]> => {
  const { data } = await api.get<Evidence[]>(`/evidence/worker/${workerId}`)
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

export const deleteEvidence = async (evidenceId: string, email: string, password: string): Promise<void> => {
  await api.post(`/evidence/${evidenceId}/delete`, { email, password })
}

export const workerSubmitEvidence = async (
  evidenceId: string,
  evidenceUrl: string,
  description?: string,
  insumosUsados?: { insumoId: string; nombre: string; cantidad: number; unidadMedida: string }[]
): Promise<Evidence> => {
  const { data } = await api.post<Evidence>(`/evidence/${evidenceId}/worker-submit`, {
    evidenceUrl,
    description,
    insumosUsados: insumosUsados && insumosUsados.length > 0 ? insumosUsados : undefined,
  })
  return data
}

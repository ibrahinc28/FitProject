import api from './api'
import type { Evidence, SubmitEvidenceRequest } from '../types/evidence'

export const getEvidenceByStep = (stepId: string): Promise<Evidence[]> =>
  api.get<Evidence[]>(`/evidence/step/${stepId}`).then((r) => r.data)

export const submitEvidence = (req: SubmitEvidenceRequest): Promise<Evidence> =>
  api.post<Evidence>('/evidence', req).then((r) => r.data)

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface InsumoUsado {
  insumoId: string
  nombre: string
  cantidad: number
  unidadMedida: string
}

export interface Evidence {
  evidenceId: string
  projectId: string
  stepId: string
  name: string
  description: string
  evidenceUrl: string
  submittedBy: string
  assignedWorkerId?: string
  assignedWorkerName?: string
  status: EvidenceStatus
  createdAt: string
  updatedAt: string
  insumosUsados?: InsumoUsado[]
}

export interface SubmitEvidenceRequest {
  stepId: string
  projectId: string
  name: string
  description: string
  submittedBy: string
  evidenceUrl: string
  assignedWorkerId?: string
  assignedWorkerName?: string
}

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Evidence {
  evidenceId: string
  projectId: string
  stepId: string
  name: string
  description: string
  evidenceUrl: string
  submittedBy: string
  status: EvidenceStatus
  createdAt: string
  updatedAt: string
}

export interface SubmitEvidenceRequest {
  stepId: string
  projectId: string
  name: string
  description: string
  submittedBy: string
  evidenceUrl: string
}

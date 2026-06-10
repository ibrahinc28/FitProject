export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Evidence {
  evidenceId: string;
  projectId: string;
  stepId: string;
  evidenceUrl: string;
  description: string;
  name: string;
  submittedBy: string;
  supervisorId?: string;
  status: EvidenceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceSubmitRequest {
  name: string;
  description: string;
  evidenceUrl: string;
  submittedBy: string;
  stepId: string;
  projectId: string;
}
export interface TaskAssignment {
  assignmentId: string
  workerId: string
  workerName: string
  stepId: string
  stepName: string
  projectId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
  updatedAt: string
}

export interface CreateAssignmentRequest {
  workerId: string
  workerName: string
  stepId: string
}

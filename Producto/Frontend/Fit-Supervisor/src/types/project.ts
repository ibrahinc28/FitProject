export interface ConstructionStep {
  stepId: string
  stepName: string
  description: string
  progress: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  order: number
}

export interface Project {
  projectId: string
  modelName: string
  clientName: string
  location: string
  overallProgress: number
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  constructionSteps: ConstructionStep[]
  startDate: string
}

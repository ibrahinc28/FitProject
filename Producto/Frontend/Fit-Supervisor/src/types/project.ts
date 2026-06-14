export interface ConstructionStep {
  stepId: string
  projectId?: string
  stepName: string
  stepStatus: boolean
  progressValue: number
  createdAt?: string
  updatedAt?: string
}

export interface Project {
  projectId: string
  containerId?: string
  modelName: string
  description?: string
  imageUrl?: string
  budget?: number
  overallProgress: number
  createdAt?: string
  updatedAt?: string
  constructionSteps: ConstructionStep[]
  evidences?: import('./evidence').Evidence[]
}

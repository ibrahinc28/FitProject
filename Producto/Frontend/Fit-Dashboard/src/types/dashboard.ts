export interface ProjectProgressDTO {
  projectId: string
  modelName: string
  overallProgress: number
  stepsCompleted: number
  totalSteps: number
  createdAt: string
}

export interface DashboardKpiDTO {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  averageProgress: number
  pendingEvidences: number
  approvedEvidences: number
  rejectedEvidences: number
  projects: ProjectProgressDTO[]
}
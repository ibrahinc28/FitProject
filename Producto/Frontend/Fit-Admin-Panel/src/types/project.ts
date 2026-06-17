import type { Evidence } from './evidence';

export interface Step {
  stepId: string;
  projectId: string;
  stepName: string;
  stepStatus: boolean;
  progressValue: number;
  evidences: Evidence[];
}

export interface Project {
  projectId: string;
  containerId?: string;
  modelName: string;
  description?: string;
  imageUrl?: string;
  budget?: number;
  supervisorId?: string;
  supervisorName?: string;
  overallProgress: number;
  constructionSteps: Step[];
  evidences: Evidence[];
}

export interface CreateProjectData {
  modelName: string;
  description?: string;
  imageUrl?: string;
  budget?: number;
  supervisorId?: string;
  supervisorName?: string;
}

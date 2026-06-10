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
  modelName: string;
  overallProgress: number;
  constructionSteps: Step[];
  evidences: Evidence[];
}
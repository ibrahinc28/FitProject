import type { Project } from '../types/project';

export const projectsMock: Project[] = [
  {
    projectId: '1',
    modelName: 'Crossfit Pro',
    overallProgress: 75,
    constructionSteps: [
      { stepId: '1', projectId: '1', stepName: 'Preparación del contenedor', stepStatus: true, progressValue: 100, evidences: [] },
      { stepId: '2', projectId: '1', stepName: 'Instalación eléctrica', stepStatus: true, progressValue: 100, evidences: [] },
      { stepId: '3', projectId: '1', stepName: 'Aislamiento térmico', stepStatus: false, progressValue: 60, evidences: [] },
      { stepId: '4', projectId: '1', stepName: 'Instalación de equipamiento', stepStatus: false, progressValue: 0, evidences: [] },
    ],
    evidences: [],
  },
  {
    projectId: '2',
    modelName: 'Yoga Studio',
    overallProgress: 45,
    constructionSteps: [
      { stepId: '5', projectId: '2', stepName: 'Preparación del contenedor', stepStatus: true, progressValue: 100, evidences: [] },
      { stepId: '6', projectId: '2', stepName: 'Instalación eléctrica', stepStatus: false, progressValue: 40, evidences: [] },
      { stepId: '7', projectId: '2', stepName: 'Ventilación natural', stepStatus: false, progressValue: 0, evidences: [] },
      { stepId: '8', projectId: '2', stepName: 'Pisos de bambú', stepStatus: false, progressValue: 0, evidences: [] },
    ],
    evidences: [],
  },
];
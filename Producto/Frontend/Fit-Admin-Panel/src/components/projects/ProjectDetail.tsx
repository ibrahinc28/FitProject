import React, { useEffect, useState } from 'react';
import type { Project, Step } from '../../types/project';
import { projectService } from '../../services/projectService';
import { evidenceService } from '../../services/evidenceService';
import EvidenceUpload from '../evidence/EvidenceUpload';
import EvidenceList from '../evidence/EvidenceList';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      const data = await projectService.getProjectById(projectId);
      setProject(data);
      setError(null);
    } catch {
      setError('No se pudo cargar el proyecto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleApprove = async (evidenceId: string) => {
    try {
      await evidenceService.approveEvidence(evidenceId, 'supervisor-default');
      await fetchProject();
    } catch {
      alert('Error al aprobar la evidencia');
    }
  };

  const handleReject = async (evidenceId: string) => {
    try {
      await evidenceService.rejectEvidence(evidenceId, 'supervisor-default');
      await fetchProject();
    } catch {
      alert('Error al rechazar la evidencia');
    }
  };

  const getStepStatusColor = (step: Step) => {
    if (step.stepStatus) return 'bg-green-500';
    if (step.progressValue > 0) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStepStatusText = (step: Step) => {
    if (step.stepStatus) return 'Completado';
    if (step.progressValue > 0) return 'En Progreso';
    return 'Pendiente';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error ?? 'Proyecto no encontrado'}
        </div>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a proyectos
            </button>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">{project.modelName}</h1>
              <p className="text-sm text-gray-500">ID: {project.projectId.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progreso general */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Progreso General</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${project.overallProgress}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-gray-900 w-16">{project.overallProgress}%</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
            <div>
              <div className="font-semibold text-gray-800">
                {project.constructionSteps.filter(s => s.stepStatus).length}
              </div>
              Completados
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {project.constructionSteps.filter(s => !s.stepStatus && s.progressValue > 0).length}
              </div>
              En progreso
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {project.constructionSteps.filter(s => !s.stepStatus && s.progressValue === 0).length}
              </div>
              Pendientes
            </div>
          </div>
        </div>

        {/* Pasos de construcción */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avance del Proyecto</h2>

          <div className="space-y-4">
            {project.constructionSteps.map((step) => (
              <div key={step.stepId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Fila del paso */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStepStatusColor(step)}`}></div>
                      <h3 className="font-semibold text-gray-900">{step.stepName}</h3>
                      {step.evidences.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {step.evidences.length} evidencia{step.evidences.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{getStepStatusText(step)}</span>
                      <span className="text-sm font-semibold">{step.progressValue}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getStepStatusColor(step)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${step.progressValue}%` }}
                      ></div>
                    </div>

                    <div className="flex gap-2">
                      {!step.stepStatus && (
                        <button
                          onClick={() => setUploadingStepId(step.stepId)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {step.progressValue > 0 ? 'Continuar' : 'Iniciar'}
                        </button>
                      )}
                      {step.evidences.length > 0 && (
                        <button
                          onClick={() => setExpandedStepId(
                            expandedStepId === step.stepId ? null : step.stepId
                          )}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          {expandedStepId === step.stepId ? 'Ocultar' : 'Ver evidencias'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidencias expandidas */}
                {expandedStepId === step.stepId && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <EvidenceList
                      evidences={step.evidences}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de subida de evidencia */}
      {uploadingStepId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setUploadingStepId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="pt-6">
              <EvidenceUpload
                stepId={uploadingStepId}
                projectId={project.projectId}
                onUpload={async () => {
                  setUploadingStepId(null);
                  await fetchProject();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
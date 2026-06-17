import React, { useEffect, useState } from 'react';
import ProjectCard from './ProjectCard';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types/project';

interface ProjectListProps {
  onProjectSelect: (projectId: string) => void;
  onCreateProject?: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect, onCreateProject }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectService.getAllProjects()
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor. Verifica que los servicios estén corriendo.');
        setLoading(false);
      });
  }, []);

  const activeProjects = projects.filter(p => p.overallProgress < 100);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Proyectos</h2>
          <p className="text-gray-600">
            {activeProjects.length} {activeProjects.length === 1 ? 'proyecto' : 'proyectos'} en curso
          </p>
        </div>
        {isAdmin && onCreateProject && (
          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </button>
        )}
      </div>

      {activeProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No hay proyectos activos</div>
          <p className="text-gray-500">Todos los proyectos han sido completados</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {activeProjects.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              onSelect={(p) => onProjectSelect(p.projectId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
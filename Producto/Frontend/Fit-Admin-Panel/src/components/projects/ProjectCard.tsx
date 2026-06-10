import React from 'react';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onSelect?: (project: Project) => void;
}

const PROGRESS_COLORS = ['bg-purple-500', 'bg-teal-500', 'bg-pink-500', 'bg-blue-500', 'bg-orange-500'];

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const colorIndex = project.projectId.charCodeAt(0) % PROGRESS_COLORS.length;
  const progressColor = PROGRESS_COLORS[colorIndex];

  return (
    <div
      className="bg-[#121212] text-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-gray-800"
      onClick={() => onSelect?.(project)}
    >
      <div className="flex h-32">
        <div className="w-full p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Proyecto #{project.projectId.slice(0, 8)}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{project.modelName}</h3>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-400">Progreso</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${progressColor} h-2 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${project.overallProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400">{project.overallProgress}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
import React from 'react';
import type { Evidence } from '../../types/evidence';

interface EvidenceCardProps {
  evidence: Evidence;
  onApprove?: (evidenceId: string) => void;
  onReject?: (evidenceId: string) => void;
}

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onApprove, onReject }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {evidence.submittedBy.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{evidence.submittedBy}</h4>
            <p className="text-xs text-gray-500">
              {new Date(evidence.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[evidence.status]}`}>
          {STATUS_LABELS[evidence.status]}
        </span>
      </div>

      {/* Nombre del archivo */}
      <p className="text-xs text-gray-500 font-medium mb-1">{evidence.name}</p>

      {/* Descripción */}
      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{evidence.description}</p>

      {/* Vista previa de imagen */}
      {evidence.evidenceUrl && (
        <div className="rounded-lg overflow-hidden mb-3">
          <img
            src={evidence.evidenceUrl}
            alt={`Evidencia de ${evidence.submittedBy}`}
            className="w-full h-32 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Botones de acción para evidencias pendientes */}
      {evidence.status === 'PENDING' && (onApprove || onReject) && (
        <div className="flex gap-2 mt-2">
          {onApprove && (
            <button
              onClick={() => onApprove(evidence.evidenceId)}
              className="flex-1 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Aprobar
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(evidence.evidenceId)}
              className="flex-1 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Rechazar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidenceCard;
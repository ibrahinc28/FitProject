import React from 'react';
import EvidenceCard from './EvidenceCard';
import type { Evidence } from '../../types/evidence';

interface EvidenceListProps {
  evidences: Evidence[];
  onApprove?: (evidenceId: string) => void;
  onReject?: (evidenceId: string) => void;
}

const EvidenceList: React.FC<EvidenceListProps> = ({ evidences, onApprove, onReject }) => {
  if (evidences.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No hay evidencias para este paso
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {evidences.map((evidence) => (
        <EvidenceCard
          key={evidence.evidenceId}
          evidence={evidence}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default EvidenceList;
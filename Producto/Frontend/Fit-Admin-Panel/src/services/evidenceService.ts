import api from './api';
import type { Evidence, EvidenceSubmitRequest } from '../types/evidence';

export const evidenceService = {
  submitEvidence: async (data: EvidenceSubmitRequest): Promise<Evidence> => {
    const { data: result } = await api.post<Evidence>('/api/v1/mobile/evidences/submit', data);
    return result;
  },

  approveEvidence: async (evidenceId: string, supervisorId: string): Promise<Evidence> => {
    const { data } = await api.post<Evidence>(
      `/api/v1/mobile/evidences/${evidenceId}/approve?supervisorId=${supervisorId}`
    );
    return data;
  },

  rejectEvidence: async (evidenceId: string, supervisorId: string): Promise<Evidence> => {
    const { data } = await api.post<Evidence>(
      `/api/v1/mobile/evidences/${evidenceId}/reject?supervisorId=${supervisorId}`
    );
    return data;
  },
};
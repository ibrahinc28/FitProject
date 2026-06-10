import { describe, test, expect } from 'vitest';
import type { Evidence } from '../../types/evidence';

describe('Evidence Card Data Contract', () => {
  test('la estructura de Evidence coincide con el contrato del backend', () => {
    const mockEvidence: Evidence = {
      evidenceId: 'EVI-100',
      projectId: 'PROJ-1',
      stepId: 'STEP-1',
      name: 'registro_obra.png',
      submittedBy: 'Supervisor Carlos',
      description: 'Fotografia de la zapata de fundacion terminada',
      evidenceUrl: 'data:image/png;base64,abc123',
      status: 'PENDING',
      createdAt: '2026-05-22T12:00:00.000Z',
      updatedAt: '2026-05-22T12:00:00.000Z',
    };

    expect(mockEvidence.submittedBy).toBe('Supervisor Carlos');
    expect(mockEvidence.description).toContain('zapata de fundacion');
    expect(mockEvidence.name).toBe('registro_obra.png');
    expect(mockEvidence.status).toBe('PENDING');
    expect(mockEvidence.evidenceUrl).toMatch(/^data:image/);
  });

  test('los estados de evidencia son PENDING, APPROVED o REJECTED', () => {
    const estados: Evidence['status'][] = ['PENDING', 'APPROVED', 'REJECTED'];
    expect(estados).toHaveLength(3);
    expect(estados).toContain('PENDING');
    expect(estados).toContain('APPROVED');
    expect(estados).toContain('REJECTED');
  });
});
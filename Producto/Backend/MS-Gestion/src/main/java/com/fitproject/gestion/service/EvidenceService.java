package com.fitproject.gestion.service;

import com.fitproject.gestion.dto.EvidenceDTO;
import com.fitproject.gestion.model.*;
import com.fitproject.gestion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final StepRepository stepRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<EvidenceDTO> getByStep(String stepId) {
        return evidenceRepository.findByStep_StepId(stepId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvidenceDTO> getPending() {
        return evidenceRepository.findByStatus(EvidenceStatus.PENDING).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvidenceDTO> getByWorker(String workerId) {
        return evidenceRepository.findByAssignedWorkerId(workerId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public EvidenceDTO submit(EvidenceDTO req) {
        ConstructionStep step = stepRepository.findById(req.getStepId())
                .orElseThrow(() -> new IllegalArgumentException("Paso no encontrado: " + req.getStepId()));
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado: " + req.getProjectId()));

        boolean isTaskAssignment = req.getAssignedWorkerId() != null && !req.getAssignedWorkerId().isBlank();
        EvidenceStatus initialStatus = EvidenceStatus.PENDING; // DB constraint only allows PENDING/APPROVED/REJECTED

        Evidence evidence = Evidence.builder()
                .project(project)
                .step(step)
                .evidenceUrl(req.getEvidenceUrl() != null ? req.getEvidenceUrl() : "")
                .description(req.getDescription() != null ? req.getDescription() : "")
                .name(req.getName())
                .submittedBy(req.getSubmittedBy())
                .assignedWorkerId(isTaskAssignment ? req.getAssignedWorkerId() : null)
                .assignedWorkerName(isTaskAssignment ? req.getAssignedWorkerName() : null)
                .status(initialStatus)
                .build();

        Evidence saved = evidenceRepository.save(evidence);

        // Recalculate progress only when real evidence is submitted (not just a task assignment)
        if (!isTaskAssignment) {
            recalculateStepProgress(step, project);
        }

        return toDTO(saved);
    }

    /**
     * Called when an assigned worker uploads their evidence for a task.
     * Changes status from ASSIGNED → PENDING (awaiting supervisor approval).
     * This is where a notification to the supervisor should be triggered
     * once a notification system is in place.
     */
    @Transactional
    public EvidenceDTO workerSubmit(String evidenceId, String evidenceUrl, String description) {
        Evidence evidence = findById(evidenceId);
        if (evidence.getAssignedWorkerId() == null || evidence.getAssignedWorkerId().isBlank()) {
            throw new IllegalArgumentException("Esta evidencia no tiene un trabajador asignado");
        }
        if (evidence.getEvidenceUrl() != null && !evidence.getEvidenceUrl().isBlank()) {
            throw new IllegalArgumentException("El trabajador ya subió la evidencia para esta tarea");
        }
        evidence.setEvidenceUrl(evidenceUrl != null ? evidenceUrl : "");
        if (description != null && !description.isBlank()) {
            evidence.setDescription(description);
        }
        // Status stays PENDING — supervisor still needs to approve
        evidenceRepository.save(evidence);
        return toDTO(evidence);
    }

    @Transactional
    public EvidenceDTO approve(String evidenceId, String supervisorId) {
        Evidence evidence = findById(evidenceId);
        evidence.setStatus(EvidenceStatus.APPROVED);
        evidence.setSupervisorId(supervisorId);
        evidenceRepository.save(evidence);
        ConstructionStep step = evidence.getStep();
        Project project = projectRepository.findById(step.getProject().getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));
        recalculateStepProgress(step, project);
        return toDTO(evidence);
    }

    @Transactional
    public EvidenceDTO reject(String evidenceId, String supervisorId) {
        Evidence evidence = findById(evidenceId);
        evidence.setStatus(EvidenceStatus.REJECTED);
        evidence.setSupervisorId(supervisorId);
        evidenceRepository.save(evidence);
        ConstructionStep step = evidence.getStep();
        Project project = projectRepository.findById(step.getProject().getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));
        recalculateStepProgress(step, project);
        return toDTO(evidence);
    }

    @Transactional
    public void delete(String evidenceId) {
        Evidence evidence = findById(evidenceId);
        ConstructionStep step = evidence.getStep();
        Project project = projectRepository.findById(step.getProject().getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado"));
        evidenceRepository.delete(evidence);
        recalculateStepProgress(step, project);
    }

    private void recalculateStepProgress(ConstructionStep step, Project project) {
        List<Evidence> all = evidenceRepository.findByStep_StepId(step.getStepId());
        long total    = all.size();
        long approved = all.stream().filter(e -> e.getStatus() == EvidenceStatus.APPROVED).count();
        int progress  = total > 0 ? (int) Math.round(approved * 100.0 / total) : 0;
        step.setProgressValue(progress);
        step.setStepStatus(progress >= 100);
        stepRepository.save(step);

        project.recalculateProgress();
        projectRepository.save(project);
    }

    private Evidence findById(String evidenceId) {
        return evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("Evidencia no encontrada: " + evidenceId));
    }

    public EvidenceDTO toDTO(Evidence e) {
        return EvidenceDTO.builder()
                .evidenceId(e.getEvidenceId())
                .projectId(e.getProject() != null ? e.getProject().getProjectId() : null)
                .stepId(e.getStep() != null ? e.getStep().getStepId() : null)
                .evidenceUrl(e.getEvidenceUrl())
                .description(e.getDescription())
                .name(e.getName())
                .submittedBy(e.getSubmittedBy())
                .supervisorId(e.getSupervisorId())
                .assignedWorkerId(e.getAssignedWorkerId())
                .assignedWorkerName(e.getAssignedWorkerName())
                .status(e.getStatus().name())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

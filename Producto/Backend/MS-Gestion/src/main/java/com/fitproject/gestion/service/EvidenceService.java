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

    @Transactional
    public EvidenceDTO submit(EvidenceDTO req) {
        ConstructionStep step = stepRepository.findById(req.getStepId())
                .orElseThrow(() -> new IllegalArgumentException("Paso no encontrado: " + req.getStepId()));
        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Proyecto no encontrado: " + req.getProjectId()));

        Evidence evidence = Evidence.builder()
                .project(project)
                .step(step)
                .evidenceUrl(req.getEvidenceUrl())
                .description(req.getDescription())
                .name(req.getName())
                .submittedBy(req.getSubmittedBy())
                .status(EvidenceStatus.PENDING)
                .build();
        return toDTO(evidenceRepository.save(evidence));
    }

    @Transactional
    public EvidenceDTO approve(String evidenceId, String supervisorId) {
        Evidence evidence = findById(evidenceId);
        evidence.setStatus(EvidenceStatus.APPROVED);
        evidence.setSupervisorId(supervisorId);
        evidenceRepository.save(evidence);

        recalculateStepProgress(evidence.getStep());
        return toDTO(evidence);
    }

    @Transactional
    public EvidenceDTO reject(String evidenceId, String supervisorId) {
        Evidence evidence = findById(evidenceId);
        evidence.setStatus(EvidenceStatus.REJECTED);
        evidence.setSupervisorId(supervisorId);
        evidenceRepository.save(evidence);

        recalculateStepProgress(evidence.getStep());
        return toDTO(evidence);
    }

    private void recalculateStepProgress(ConstructionStep step) {
        List<Evidence> all = evidenceRepository.findByStep_StepId(step.getStepId());
        long total    = all.size();
        long approved = all.stream().filter(e -> e.getStatus() == EvidenceStatus.APPROVED).count();
        int progress  = total > 0 ? (int) Math.round(approved * 100.0 / total) : 0;
        step.setProgressValue(progress);
        step.setStepStatus(progress >= 100);
        stepRepository.save(step);

        Project project = step.getProject();
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
                .status(e.getStatus().name())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}

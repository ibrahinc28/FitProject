package com.fitproject.bff.client;

import com.fitproject.bff.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "ms-gestion", url = "${services.ms-gestion.url:http://localhost:8080/api/v1}")
public interface GestionClient {

    // ── Proyectos ──────────────────────────────────────────────────
    @GetMapping("/projects")
    List<ProjectDTO> getAllProjects();

    @GetMapping("/projects/{projectId}")
    ProjectDTO getProjectById(@PathVariable("projectId") String projectId);

    // ── Evidencias ─────────────────────────────────────────────────
    @PostMapping("/evidences/submit")
    EvidenceDTO submitEvidence(@RequestBody EvidenceDTO request);

    @PostMapping("/evidences/{evidenceId}/approve")
    EvidenceDTO approveEvidence(@PathVariable("evidenceId") String evidenceId,
                                @RequestParam("supervisorId") String supervisorId);

    @PostMapping("/evidences/{evidenceId}/reject")
    EvidenceDTO rejectEvidence(@PathVariable("evidenceId") String evidenceId,
                               @RequestParam("supervisorId") String supervisorId);

}
package com.fitproject.bff.controller;

import com.fitproject.bff.client.GestionClient;
import com.fitproject.bff.dto.EvidenceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/evidence")
@RequiredArgsConstructor
@Slf4j
public class SupervisorEvidenceController {

    private final GestionClient gestionClient;

    @GetMapping("/step/{stepId}")
    public ResponseEntity<List<EvidenceDTO>> getByStep(@PathVariable String stepId) {
        log.info("GET /api/v1/evidence/step/{}", stepId);
        return ResponseEntity.ok(gestionClient.getEvidenceByStep(stepId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<EvidenceDTO>> getPending() {
        log.info("GET /api/v1/evidence/pending");
        return ResponseEntity.ok(gestionClient.getPendingEvidences());
    }

    @PostMapping
    public ResponseEntity<EvidenceDTO> submit(@RequestBody EvidenceDTO request) {
        log.info("POST /api/v1/evidence stepId={}", request.getStepId());
        return ResponseEntity.ok(gestionClient.submitEvidence(request));
    }

    @PostMapping("/{evidenceId}/approve")
    public ResponseEntity<EvidenceDTO> approve(
            @PathVariable String evidenceId,
            @RequestParam(required = false, defaultValue = "") String supervisorId) {
        log.info("POST /api/v1/evidence/{}/approve supervisorId={}", evidenceId, supervisorId);
        return ResponseEntity.ok(gestionClient.approveEvidence(evidenceId, supervisorId));
    }

    @PostMapping("/{evidenceId}/reject")
    public ResponseEntity<EvidenceDTO> reject(
            @PathVariable String evidenceId,
            @RequestParam(required = false, defaultValue = "") String supervisorId) {
        log.info("POST /api/v1/evidence/{}/reject supervisorId={}", evidenceId, supervisorId);
        return ResponseEntity.ok(gestionClient.rejectEvidence(evidenceId, supervisorId));
    }
}

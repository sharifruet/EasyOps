package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.entity.NonConformance;
import com.easyops.manufacturing.service.NonConformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/quality/non-conformances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NonConformanceController {

    private final NonConformanceService nonConformanceService;

    @GetMapping
    public ResponseEntity<List<NonConformance>> getAllNonConformances(@RequestParam UUID organizationId) {
        List<NonConformance> ncs = nonConformanceService.getAllNonConformances(organizationId);
        return ResponseEntity.ok(ncs);
    }

    @GetMapping("/{ncId}")
    public ResponseEntity<NonConformance> getNonConformanceById(@PathVariable UUID ncId) {
        return nonConformanceService.getNonConformanceById(ncId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<NonConformance>> getNonConformancesByStatus(
            @PathVariable String status,
            @RequestParam UUID organizationId) {
        List<NonConformance> ncs = nonConformanceService.getNonConformancesByStatus(organizationId, status);
        return ResponseEntity.ok(ncs);
    }

    @GetMapping("/open")
    public ResponseEntity<List<NonConformance>> getOpenNonConformances(@RequestParam UUID organizationId) {
        List<NonConformance> ncs = nonConformanceService.getOpenNonConformances(organizationId);
        return ResponseEntity.ok(ncs);
    }

    @GetMapping("/critical")
    public ResponseEntity<List<NonConformance>> getCriticalOpenNCs(@RequestParam UUID organizationId) {
        List<NonConformance> ncs = nonConformanceService.getCriticalOpenNCs(organizationId);
        return ResponseEntity.ok(ncs);
    }

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<NonConformance>> getNonConformancesByWorkOrder(@PathVariable UUID workOrderId) {
        List<NonConformance> ncs = nonConformanceService.getNonConformancesByWorkOrder(workOrderId);
        return ResponseEntity.ok(ncs);
    }

    @PostMapping
    public ResponseEntity<NonConformance> createNonConformance(@RequestBody NonConformance nc) {
        NonConformance created = nonConformanceService.createNonConformance(nc);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{ncId}")
    public ResponseEntity<NonConformance> updateNonConformance(
            @PathVariable UUID ncId,
            @RequestBody NonConformance nc) {
        NonConformance updated = nonConformanceService.updateNonConformance(ncId, nc);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{ncId}")
    public ResponseEntity<Void> deleteNonConformance(@PathVariable UUID ncId) {
        nonConformanceService.deleteNonConformance(ncId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{ncId}/assign")
    public ResponseEntity<NonConformance> assignNonConformance(
            @PathVariable UUID ncId,
            @RequestParam UUID assignedTo) {
        NonConformance assigned = nonConformanceService.assignNonConformance(ncId, assignedTo);
        return ResponseEntity.ok(assigned);
    }

    @PostMapping("/{ncId}/resolve")
    public ResponseEntity<NonConformance> resolveNonConformance(
            @PathVariable UUID ncId,
            @RequestParam String disposition,
            @RequestParam String resolutionNotes,
            @RequestParam UUID resolvedBy) {
        NonConformance resolved = nonConformanceService.resolveNonConformance(ncId, disposition, resolutionNotes, resolvedBy);
        return ResponseEntity.ok(resolved);
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = nonConformanceService.getNonConformanceDashboardStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}


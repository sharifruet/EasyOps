package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.entity.QualityInspection;
import com.easyops.manufacturing.entity.QualityInspectionItem;
import com.easyops.manufacturing.service.QualityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/quality/inspections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QualityController {

    private final QualityService qualityService;

    @GetMapping
    public ResponseEntity<List<QualityInspection>> getAllInspections(@RequestParam UUID organizationId) {
        List<QualityInspection> inspections = qualityService.getAllInspections(organizationId);
        return ResponseEntity.ok(inspections);
    }

    @GetMapping("/{inspectionId}")
    public ResponseEntity<QualityInspection> getInspectionById(@PathVariable UUID inspectionId) {
        return qualityService.getInspectionById(inspectionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<QualityInspection>> getInspectionsByStatus(
            @PathVariable String status,
            @RequestParam UUID organizationId) {
        List<QualityInspection> inspections = qualityService.getInspectionsByStatus(organizationId, status);
        return ResponseEntity.ok(inspections);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<QualityInspection>> getInspectionsByProduct(
            @PathVariable UUID productId,
            @RequestParam UUID organizationId) {
        List<QualityInspection> inspections = qualityService.getInspectionsByProduct(organizationId, productId);
        return ResponseEntity.ok(inspections);
    }

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<QualityInspection>> getInspectionsByWorkOrder(@PathVariable UUID workOrderId) {
        List<QualityInspection> inspections = qualityService.getInspectionsByWorkOrder(workOrderId);
        return ResponseEntity.ok(inspections);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<QualityInspection>> getPendingInspections(@RequestParam UUID organizationId) {
        List<QualityInspection> inspections = qualityService.getPendingInspections(organizationId);
        return ResponseEntity.ok(inspections);
    }

    @PostMapping
    public ResponseEntity<QualityInspection> createInspection(@RequestBody QualityInspection inspection) {
        QualityInspection created = qualityService.createInspection(inspection);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{inspectionId}")
    public ResponseEntity<QualityInspection> updateInspection(
            @PathVariable UUID inspectionId,
            @RequestBody QualityInspection inspection) {
        QualityInspection updated = qualityService.updateInspection(inspectionId, inspection);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{inspectionId}")
    public ResponseEntity<Void> deleteInspection(@PathVariable UUID inspectionId) {
        qualityService.deleteInspection(inspectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{inspectionId}/complete")
    public ResponseEntity<QualityInspection> completeInspection(
            @PathVariable UUID inspectionId,
            @RequestParam String overallResult,
            @RequestParam UUID completedBy) {
        QualityInspection completed = qualityService.completeInspection(inspectionId, overallResult, completedBy);
        return ResponseEntity.ok(completed);
    }

    // Inspection Items
    @GetMapping("/{inspectionId}/items")
    public ResponseEntity<List<QualityInspectionItem>> getInspectionItems(@PathVariable UUID inspectionId) {
        List<QualityInspectionItem> items = qualityService.getInspectionItems(inspectionId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/{inspectionId}/items")
    public ResponseEntity<QualityInspectionItem> addInspectionItem(@RequestBody QualityInspectionItem item) {
        QualityInspectionItem created = qualityService.addInspectionItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<QualityInspectionItem> updateInspectionItem(
            @PathVariable UUID itemId,
            @RequestBody QualityInspectionItem item) {
        QualityInspectionItem updated = qualityService.updateInspectionItem(itemId, item);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteInspectionItem(@PathVariable UUID itemId) {
        qualityService.deleteInspectionItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // Dashboard
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = qualityService.getQualityDashboardStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}


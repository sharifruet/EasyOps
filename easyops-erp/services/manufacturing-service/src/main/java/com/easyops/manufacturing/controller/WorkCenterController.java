package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.entity.EquipmentMaintenance;
import com.easyops.manufacturing.entity.WorkCenter;
import com.easyops.manufacturing.service.WorkCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/work-centers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkCenterController {

    private final WorkCenterService workCenterService;

    // ==================== Work Center Endpoints ====================

    @GetMapping
    public ResponseEntity<List<WorkCenter>> getAllWorkCenters(@RequestParam UUID organizationId) {
        List<WorkCenter> workCenters = workCenterService.getAllWorkCenters(organizationId);
        return ResponseEntity.ok(workCenters);
    }

    @GetMapping("/{workCenterId}")
    public ResponseEntity<WorkCenter> getWorkCenterById(@PathVariable UUID workCenterId) {
        return workCenterService.getWorkCenterById(workCenterId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{workCenterCode}")
    public ResponseEntity<WorkCenter> getWorkCenterByCode(
            @PathVariable String workCenterCode,
            @RequestParam UUID organizationId) {
        return workCenterService.getWorkCenterByCode(organizationId, workCenterCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<List<WorkCenter>> getActiveWorkCenters(@RequestParam UUID organizationId) {
        List<WorkCenter> workCenters = workCenterService.getActiveWorkCenters(organizationId);
        return ResponseEntity.ok(workCenters);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<WorkCenter>> getWorkCentersByType(
            @PathVariable String type,
            @RequestParam UUID organizationId) {
        List<WorkCenter> workCenters = workCenterService.getWorkCentersByType(organizationId, type);
        return ResponseEntity.ok(workCenters);
    }

    @PostMapping
    public ResponseEntity<WorkCenter> createWorkCenter(@RequestBody WorkCenter workCenter) {
        WorkCenter created = workCenterService.createWorkCenter(workCenter);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{workCenterId}")
    public ResponseEntity<WorkCenter> updateWorkCenter(
            @PathVariable UUID workCenterId,
            @RequestBody WorkCenter workCenter) {
        WorkCenter updated = workCenterService.updateWorkCenter(workCenterId, workCenter);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{workCenterId}")
    public ResponseEntity<Void> deleteWorkCenter(@PathVariable UUID workCenterId) {
        workCenterService.deleteWorkCenter(workCenterId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{workCenterId}/status")
    public ResponseEntity<WorkCenter> updateWorkCenterStatus(
            @PathVariable UUID workCenterId,
            @RequestParam String status) {
        WorkCenter updated = workCenterService.updateWorkCenterStatus(workCenterId, status);
        return ResponseEntity.ok(updated);
    }

    // ==================== Equipment Maintenance Endpoints ====================

    @GetMapping("/{workCenterId}/maintenance")
    public ResponseEntity<List<EquipmentMaintenance>> getMaintenanceByWorkCenter(@PathVariable UUID workCenterId) {
        List<EquipmentMaintenance> maintenance = workCenterService.getMaintenanceByWorkCenter(workCenterId);
        return ResponseEntity.ok(maintenance);
    }

    @GetMapping("/maintenance")
    public ResponseEntity<List<EquipmentMaintenance>> getAllMaintenance(@RequestParam UUID organizationId) {
        List<EquipmentMaintenance> maintenance = workCenterService.getAllMaintenance(organizationId);
        return ResponseEntity.ok(maintenance);
    }

    @GetMapping("/maintenance/{maintenanceId}")
    public ResponseEntity<EquipmentMaintenance> getMaintenanceById(@PathVariable UUID maintenanceId) {
        return workCenterService.getMaintenanceById(maintenanceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/maintenance/overdue")
    public ResponseEntity<List<EquipmentMaintenance>> getOverdueMaintenance() {
        List<EquipmentMaintenance> maintenance = workCenterService.getOverdueMaintenance();
        return ResponseEntity.ok(maintenance);
    }

    @PostMapping("/maintenance")
    public ResponseEntity<EquipmentMaintenance> createMaintenance(@RequestBody EquipmentMaintenance maintenance) {
        EquipmentMaintenance created = workCenterService.createMaintenance(maintenance);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/maintenance/{maintenanceId}")
    public ResponseEntity<EquipmentMaintenance> updateMaintenance(
            @PathVariable UUID maintenanceId,
            @RequestBody EquipmentMaintenance maintenance) {
        EquipmentMaintenance updated = workCenterService.updateMaintenance(maintenanceId, maintenance);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/maintenance/{maintenanceId}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable UUID maintenanceId) {
        workCenterService.deleteMaintenance(maintenanceId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/maintenance/{maintenanceId}/start")
    public ResponseEntity<EquipmentMaintenance> startMaintenance(
            @PathVariable UUID maintenanceId,
            @RequestParam UUID userId) {
        EquipmentMaintenance started = workCenterService.startMaintenance(maintenanceId, userId);
        return ResponseEntity.ok(started);
    }

    @PostMapping("/maintenance/{maintenanceId}/complete")
    public ResponseEntity<EquipmentMaintenance> completeMaintenance(
            @PathVariable UUID maintenanceId,
            @RequestParam UUID completedBy) {
        EquipmentMaintenance completed = workCenterService.completeMaintenance(maintenanceId, completedBy);
        return ResponseEntity.ok(completed);
    }

    // Dashboard
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = workCenterService.getWorkCenterDashboardStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}


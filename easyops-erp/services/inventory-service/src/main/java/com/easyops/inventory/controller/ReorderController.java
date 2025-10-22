package com.easyops.inventory.controller;

import com.easyops.inventory.entity.ReorderAlert;
import com.easyops.inventory.entity.ReorderRule;
import com.easyops.inventory.service.ReorderRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/reorder")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Reorder Management", description = "Reorder point automation and alert management APIs")
@CrossOrigin(origins = "*")
public class ReorderController {
    
    private final ReorderRuleService reorderRuleService;
    
    // Reorder Rules
    
    @GetMapping("/rules")
    @Operation(summary = "Get all reorder rules")
    public ResponseEntity<List<ReorderRule>> getAllRules(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean activeOnly) {
        log.info("GET /api/inventory/reorder/rules - org: {}, activeOnly: {}", organizationId, activeOnly);
        
        List<ReorderRule> rules = Boolean.TRUE.equals(activeOnly)
            ? reorderRuleService.getActiveRules(organizationId)
            : reorderRuleService.getAllRules(organizationId);
        
        return ResponseEntity.ok(rules);
    }
    
    @GetMapping("/rules/{id}")
    @Operation(summary = "Get reorder rule by ID")
    public ResponseEntity<ReorderRule> getRuleById(@PathVariable UUID id) {
        log.info("GET /api/inventory/reorder/rules/{}", id);
        ReorderRule rule = reorderRuleService.getRuleById(id);
        return ResponseEntity.ok(rule);
    }
    
    @PostMapping("/rules")
    @Operation(summary = "Create new reorder rule")
    public ResponseEntity<ReorderRule> createRule(@Valid @RequestBody ReorderRule rule) {
        log.info("POST /api/inventory/reorder/rules - product: {}, warehouse: {}", 
                 rule.getProductId(), rule.getWarehouseId());
        ReorderRule created = reorderRuleService.createRule(rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/rules/{id}")
    @Operation(summary = "Update reorder rule")
    public ResponseEntity<ReorderRule> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody ReorderRule rule) {
        log.info("PUT /api/inventory/reorder/rules/{}", id);
        ReorderRule updated = reorderRuleService.updateRule(id, rule);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/rules/{id}")
    @Operation(summary = "Delete reorder rule")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
        log.info("DELETE /api/inventory/reorder/rules/{}", id);
        reorderRuleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/rules/{id}/check")
    @Operation(summary = "Manually check reorder rule now")
    public ResponseEntity<Void> checkRuleNow(@PathVariable UUID id) {
        log.info("POST /api/inventory/reorder/rules/{}/check", id);
        reorderRuleService.checkRuleNow(id);
        return ResponseEntity.ok().build();
    }
    
    // Reorder Alerts
    
    @GetMapping("/alerts")
    @Operation(summary = "Get all reorder alerts")
    public ResponseEntity<List<ReorderAlert>> getAllAlerts(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean openOnly) {
        log.info("GET /api/inventory/reorder/alerts - org: {}, openOnly: {}", organizationId, openOnly);
        
        List<ReorderAlert> alerts = Boolean.TRUE.equals(openOnly)
            ? reorderRuleService.getOpenAlerts(organizationId)
            : reorderRuleService.getAllAlerts(organizationId);
        
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/alerts/{id}")
    @Operation(summary = "Get alert by ID")
    public ResponseEntity<ReorderAlert> getAlertById(@PathVariable UUID id) {
        log.info("GET /api/inventory/reorder/alerts/{}", id);
        ReorderAlert alert = reorderRuleService.getAlertById(id);
        return ResponseEntity.ok(alert);
    }
    
    @PostMapping("/alerts/{id}/acknowledge")
    @Operation(summary = "Acknowledge reorder alert")
    public ResponseEntity<ReorderAlert> acknowledgeAlert(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        log.info("POST /api/inventory/reorder/alerts/{}/acknowledge", id);
        
        UUID userId = UUID.fromString(request.get("userId").toString());
        ReorderAlert alert = reorderRuleService.acknowledgeAlert(id, userId);
        
        return ResponseEntity.ok(alert);
    }
    
    @PostMapping("/alerts/{id}/close")
    @Operation(summary = "Close reorder alert")
    public ResponseEntity<ReorderAlert> closeAlert(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> request) {
        log.info("POST /api/inventory/reorder/alerts/{}/close", id);
        
        String notes = request != null && request.containsKey("notes") 
            ? request.get("notes").toString() 
            : null;
        
        ReorderAlert alert = reorderRuleService.closeAlert(id, notes);
        return ResponseEntity.ok(alert);
    }
}


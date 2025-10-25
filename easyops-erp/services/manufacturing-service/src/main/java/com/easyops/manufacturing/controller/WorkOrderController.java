package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.entity.WorkOrder;
import com.easyops.manufacturing.entity.WorkOrderMaterial;
import com.easyops.manufacturing.entity.WorkOrderOperation;
import com.easyops.manufacturing.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/work-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    // ==================== Work Order CRUD ====================

    @GetMapping
    public ResponseEntity<List<WorkOrder>> getAllWorkOrders(@RequestParam UUID organizationId) {
        List<WorkOrder> workOrders = workOrderService.getAllWorkOrders(organizationId);
        return ResponseEntity.ok(workOrders);
    }

    @GetMapping("/{workOrderId}")
    public ResponseEntity<WorkOrder> getWorkOrderById(@PathVariable UUID workOrderId) {
        return workOrderService.getWorkOrderById(workOrderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{workOrderNumber}")
    public ResponseEntity<WorkOrder> getWorkOrderByNumber(
            @PathVariable String workOrderNumber,
            @RequestParam UUID organizationId) {
        return workOrderService.getWorkOrderByNumber(organizationId, workOrderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<WorkOrder>> getWorkOrdersByStatus(
            @PathVariable String status,
            @RequestParam UUID organizationId) {
        List<WorkOrder> workOrders = workOrderService.getWorkOrdersByStatus(organizationId, status);
        return ResponseEntity.ok(workOrders);
    }

    @GetMapping("/active")
    public ResponseEntity<List<WorkOrder>> getActiveWorkOrders(@RequestParam UUID organizationId) {
        List<WorkOrder> workOrders = workOrderService.getActiveWorkOrders(organizationId);
        return ResponseEntity.ok(workOrders);
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<WorkOrder>> getOverdueWorkOrders(@RequestParam UUID organizationId) {
        List<WorkOrder> workOrders = workOrderService.getOverdueWorkOrders(organizationId);
        return ResponseEntity.ok(workOrders);
    }

    @PostMapping
    public ResponseEntity<WorkOrder> createWorkOrder(@RequestBody WorkOrder workOrder) {
        WorkOrder created = workOrderService.createWorkOrder(workOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{workOrderId}")
    public ResponseEntity<WorkOrder> updateWorkOrder(
            @PathVariable UUID workOrderId,
            @RequestBody WorkOrder workOrder) {
        WorkOrder updated = workOrderService.updateWorkOrder(workOrderId, workOrder);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{workOrderId}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable UUID workOrderId) {
        workOrderService.deleteWorkOrder(workOrderId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Work Order Lifecycle ====================

    @PostMapping("/{workOrderId}/release")
    public ResponseEntity<WorkOrder> releaseWorkOrder(
            @PathVariable UUID workOrderId,
            @RequestParam UUID releasedBy) {
        WorkOrder released = workOrderService.releaseWorkOrder(workOrderId, releasedBy);
        return ResponseEntity.ok(released);
    }

    @PostMapping("/{workOrderId}/start")
    public ResponseEntity<WorkOrder> startWorkOrder(
            @PathVariable UUID workOrderId,
            @RequestParam UUID userId) {
        WorkOrder started = workOrderService.startWorkOrder(workOrderId, userId);
        return ResponseEntity.ok(started);
    }

    @PostMapping("/{workOrderId}/complete")
    public ResponseEntity<WorkOrder> completeWorkOrder(
            @PathVariable UUID workOrderId,
            @RequestParam UUID completedBy) {
        WorkOrder completed = workOrderService.completeWorkOrder(workOrderId, completedBy);
        return ResponseEntity.ok(completed);
    }

    @PostMapping("/{workOrderId}/close")
    public ResponseEntity<WorkOrder> closeWorkOrder(@PathVariable UUID workOrderId) {
        WorkOrder closed = workOrderService.closeWorkOrder(workOrderId);
        return ResponseEntity.ok(closed);
    }

    @PostMapping("/{workOrderId}/cancel")
    public ResponseEntity<WorkOrder> cancelWorkOrder(
            @PathVariable UUID workOrderId,
            @RequestParam String reason) {
        WorkOrder cancelled = workOrderService.cancelWorkOrder(workOrderId, reason);
        return ResponseEntity.ok(cancelled);
    }

    // ==================== Material Management ====================

    @PostMapping("/{workOrderId}/materials/reserve")
    public ResponseEntity<Void> reserveMaterials(@PathVariable UUID workOrderId) {
        workOrderService.reserveMaterials(workOrderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{workOrderId}/materials/unreserve")
    public ResponseEntity<Void> unreserveMaterials(@PathVariable UUID workOrderId) {
        workOrderService.unreserveMaterials(workOrderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/materials/{materialId}/issue")
    public ResponseEntity<WorkOrderMaterial> issueMaterial(
            @PathVariable UUID materialId,
            @RequestParam BigDecimal quantity,
            @RequestParam UUID issuedBy) {
        WorkOrderMaterial issued = workOrderService.issueMaterial(materialId, quantity, issuedBy);
        return ResponseEntity.ok(issued);
    }

    @PostMapping("/materials/{materialId}/consume")
    public ResponseEntity<WorkOrderMaterial> consumeMaterial(
            @PathVariable UUID materialId,
            @RequestParam BigDecimal quantity) {
        WorkOrderMaterial consumed = workOrderService.consumeMaterial(materialId, quantity);
        return ResponseEntity.ok(consumed);
    }

    @PostMapping("/{workOrderId}/materials/backflush")
    public ResponseEntity<Void> backflushMaterials(@PathVariable UUID workOrderId) {
        workOrderService.backflushMaterials(workOrderId);
        return ResponseEntity.ok().build();
    }

    // ==================== Operation Management ====================

    @GetMapping("/{workOrderId}/operations")
    public ResponseEntity<List<WorkOrderOperation>> getWorkOrderOperations(@PathVariable UUID workOrderId) {
        List<WorkOrderOperation> operations = workOrderService.getWorkOrderOperations(workOrderId);
        return ResponseEntity.ok(operations);
    }

    @PostMapping("/operations/{operationId}/start")
    public ResponseEntity<WorkOrderOperation> startOperation(
            @PathVariable UUID operationId,
            @RequestParam UUID userId) {
        WorkOrderOperation started = workOrderService.startOperation(operationId, userId);
        return ResponseEntity.ok(started);
    }

    @PostMapping("/operations/{operationId}/complete")
    public ResponseEntity<WorkOrderOperation> completeOperation(
            @PathVariable UUID operationId,
            @RequestParam BigDecimal quantityCompleted,
            @RequestParam UUID completedBy) {
        WorkOrderOperation completed = workOrderService.completeOperation(operationId, quantityCompleted, completedBy);
        return ResponseEntity.ok(completed);
    }

    // ==================== Progress & Cost Management ====================

    @PostMapping("/{workOrderId}/progress/update")
    public ResponseEntity<Void> updateProgress(@PathVariable UUID workOrderId) {
        workOrderService.updateWorkOrderProgress(workOrderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{workOrderId}/costs/recalculate")
    public ResponseEntity<Void> recalculateCosts(@PathVariable UUID workOrderId) {
        workOrderService.recalculateWorkOrderCosts(workOrderId);
        return ResponseEntity.ok().build();
    }

    // ==================== Dashboard & Stats ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = workOrderService.getDashboardStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}


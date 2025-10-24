package com.easyops.purchase.controller;

import com.easyops.purchase.entity.PurchaseOrder;
import com.easyops.purchase.service.PurchaseOrderService;
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
@RequestMapping("/api/purchase/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Purchase Orders", description = "Purchase order management APIs")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {
    
    private final PurchaseOrderService purchaseOrderService;
    
    @GetMapping
    @Operation(summary = "Get all purchase orders for an organization")
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        log.info("GET /api/purchase/orders - organizationId: {}, status: {}", organizationId, status);
        List<PurchaseOrder> orders = purchaseOrderService.getAllPurchaseOrders(organizationId, status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable UUID id) {
        log.info("GET /api/purchase/orders/{}", id);
        PurchaseOrder order = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/recent")
    @Operation(summary = "Get recent purchase orders")
    public ResponseEntity<List<PurchaseOrder>> getRecentPurchaseOrders(
            @RequestParam UUID organizationId,
            @RequestParam(defaultValue = "5") int limit) {
        log.info("GET /api/purchase/orders/recent - organizationId: {}, limit: {}", organizationId, limit);
        List<PurchaseOrder> orders = purchaseOrderService.getAllPurchaseOrders(organizationId, null);
        List<PurchaseOrder> recentOrders = orders.stream().limit(limit).toList();
        return ResponseEntity.ok(recentOrders);
    }
    
    @PostMapping
    @Operation(summary = "Create new purchase order")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrder request) {
        log.info("POST /api/purchase/orders - Creating PO: {}", request.getPoNumber());
        PurchaseOrder order = purchaseOrderService.createPurchaseOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update purchase order")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(
            @PathVariable UUID id,
            @Valid @RequestBody PurchaseOrder request) {
        log.info("PUT /api/purchase/orders/{}", id);
        PurchaseOrder order = purchaseOrderService.updatePurchaseOrder(id, request);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve purchase order")
    public ResponseEntity<PurchaseOrder> approvePurchaseOrder(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        log.info("POST /api/purchase/orders/{}/approve", id);
        String approvedBy = request.get("approvedBy");
        PurchaseOrder order = purchaseOrderService.approvePurchaseOrder(id, approvedBy);
        return ResponseEntity.ok(order);
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel purchase order")
    public ResponseEntity<Void> cancelPurchaseOrder(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        log.info("POST /api/purchase/orders/{}/cancel", id);
        String cancelledBy = request.get("cancelledBy");
        String reason = request.get("reason");
        purchaseOrderService.cancelPurchaseOrder(id, cancelledBy, reason);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete purchase order")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable UUID id) {
        log.info("DELETE /api/purchase/orders/{}", id);
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}


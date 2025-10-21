package com.easyops.sales.controller;

import com.easyops.sales.dto.SalesOrderRequest;
import com.easyops.sales.entity.SalesOrder;
import com.easyops.sales.service.SalesOrderService;
import com.easyops.sales.service.SalesIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sales/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sales Orders", description = "Sales order management")
public class SalesOrderController {
    
    private final SalesOrderService salesOrderService;
    private final SalesIntegrationService salesIntegrationService;
    
    @GetMapping
    @Operation(summary = "Get all sales orders for an organization")
    public ResponseEntity<List<SalesOrder>> getAllOrders(
            @RequestParam("organizationId") UUID organizationId,
            @RequestParam(value = "status", required = false) String status) {
        
        log.info("GET /api/sales/orders - organizationId: {}, status: {}", organizationId, status);
        
        List<SalesOrder> orders = status != null 
                ? salesOrderService.getOrdersByStatus(organizationId, status)
                : salesOrderService.getAllOrders(organizationId);
        
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get orders for a specific customer")
    public ResponseEntity<List<SalesOrder>> getOrdersByCustomer(
            @RequestParam("organizationId") UUID organizationId,
            @PathVariable("customerId") UUID customerId) {
        
        log.info("GET /api/sales/orders/customer/{} - organizationId: {}", customerId, organizationId);
        
        List<SalesOrder> orders = salesOrderService.getOrdersByCustomer(organizationId, customerId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/ready-for-invoicing")
    @Operation(summary = "Get orders ready for invoicing")
    public ResponseEntity<List<SalesOrder>> getOrdersReadyForInvoicing(@RequestParam("organizationId") UUID organizationId) {
        log.info("GET /api/sales/orders/ready-for-invoicing - organizationId: {}", organizationId);
        return ResponseEntity.ok(salesOrderService.getOrdersReadyForInvoicing(organizationId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get sales order by ID")
    public ResponseEntity<SalesOrder> getOrderById(@PathVariable("id") UUID id) {
        log.info("GET /api/sales/orders/{}", id);
        return ResponseEntity.ok(salesOrderService.getOrderById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new sales order")
    public ResponseEntity<SalesOrder> createOrder(@Valid @RequestBody SalesOrderRequest request) {
        log.info("POST /api/sales/orders - Creating order for organization: {}", request.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(salesOrderService.createOrder(request));
    }
    
    @PostMapping("/from-quotation/{quotationId}")
    @Operation(summary = "Create sales order from quotation")
    public ResponseEntity<SalesOrder> createOrderFromQuotation(@PathVariable("quotationId") UUID quotationId) {
        log.info("POST /api/sales/orders/from-quotation/{}", quotationId);
        return ResponseEntity.status(HttpStatus.CREATED).body(salesOrderService.createOrderFromQuotation(quotationId));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update sales order")
    public ResponseEntity<SalesOrder> updateOrder(
            @PathVariable("id") UUID id,
            @Valid @RequestBody SalesOrderRequest request) {
        log.info("PUT /api/sales/orders/{}", id);
        return ResponseEntity.ok(salesOrderService.updateOrder(id, request));
    }
    
    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm sales order")
    public ResponseEntity<SalesOrder> confirmOrder(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/orders/{}/confirm", id);
        return ResponseEntity.ok(salesOrderService.confirmOrder(id));
    }
    
    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve sales order")
    public ResponseEntity<SalesOrder> approveOrder(
            @PathVariable("id") UUID id,
            @RequestParam("approvedBy") UUID approvedBy) {
        log.info("POST /api/sales/orders/{}/approve - approvedBy: {}", id, approvedBy);
        return ResponseEntity.ok(salesOrderService.approveOrder(id, approvedBy));
    }
    
    @PostMapping("/{id}/start-processing")
    @Operation(summary = "Start processing order")
    public ResponseEntity<SalesOrder> startProcessing(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/orders/{}/start-processing", id);
        return ResponseEntity.ok(salesOrderService.startProcessing(id));
    }
    
    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete order")
    public ResponseEntity<SalesOrder> completeOrder(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/orders/{}/complete", id);
        return ResponseEntity.ok(salesOrderService.completeOrder(id));
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel order")
    public ResponseEntity<SalesOrder> cancelOrder(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/orders/{}/cancel", id);
        return ResponseEntity.ok(salesOrderService.cancelOrder(id));
    }
    
    @PostMapping("/{id}/convert-to-invoice")
    @Operation(summary = "Convert sales order to AR invoice")
    public ResponseEntity<Map<String, Object>> convertToInvoice(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/orders/{}/convert-to-invoice", id);
        UUID invoiceId = salesIntegrationService.convertOrderToInvoice(id);
        Map<String, Object> response = new HashMap<>();
        response.put("invoiceId", invoiceId);
        response.put("message", "Successfully converted order to invoice");
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete sales order")
    public ResponseEntity<Void> deleteOrder(@PathVariable("id") UUID id) {
        log.info("DELETE /api/sales/orders/{}", id);
        salesOrderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}


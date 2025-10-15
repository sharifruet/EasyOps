package com.easyops.ar.controller;

import com.easyops.ar.dto.InvoiceRequest;
import com.easyops.ar.entity.ARInvoice;
import com.easyops.ar.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ar/invoices")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AR Invoices", description = "Invoice management for Accounts Receivable")
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    
    @GetMapping
    @Operation(summary = "Get all invoices for an organization")
    public ResponseEntity<List<ARInvoice>> getAllInvoices(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /api/ar/invoices - organizationId: {}, status: {}", organizationId, status);
        
        List<ARInvoice> invoices = status != null 
                ? invoiceService.getInvoicesByStatus(organizationId, status)
                : invoiceService.getAllInvoices(organizationId);
        
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/outstanding")
    @Operation(summary = "Get outstanding invoices (unpaid)")
    public ResponseEntity<List<ARInvoice>> getOutstandingInvoices(@RequestParam UUID organizationId) {
        log.info("GET /api/ar/invoices/outstanding - organizationId: {}", organizationId);
        List<ARInvoice> invoices = invoiceService.getOutstandingInvoices(organizationId);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/overdue")
    @Operation(summary = "Get overdue invoices")
    public ResponseEntity<List<ARInvoice>> getOverdueInvoices(@RequestParam UUID organizationId) {
        log.info("GET /api/ar/invoices/overdue - organizationId: {}", organizationId);
        List<ARInvoice> invoices = invoiceService.getOverdueInvoices(organizationId);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<ARInvoice> getInvoiceById(@PathVariable UUID id) {
        log.info("GET /api/ar/invoices/{}", id);
        ARInvoice invoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(invoice);
    }
    
    @PostMapping
    @Operation(summary = "Create new invoice")
    public ResponseEntity<ARInvoice> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        log.info("POST /api/ar/invoices - Creating invoice: {}", request.getInvoiceNumber());
        ARInvoice invoice = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
    }
    
    @PostMapping("/{id}/post")
    @Operation(summary = "Post invoice (change status from DRAFT to POSTED)")
    public ResponseEntity<ARInvoice> postInvoice(@PathVariable UUID id) {
        log.info("POST /api/ar/invoices/{}/post", id);
        ARInvoice invoice = invoiceService.postInvoice(id);
        return ResponseEntity.ok(invoice);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete invoice")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        log.info("DELETE /api/ar/invoices/{}", id);
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}


package com.easyops.sales.controller;

import com.easyops.sales.dto.QuotationRequest;
import com.easyops.sales.entity.Quotation;
import com.easyops.sales.service.QuotationService;
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
@RequestMapping("/api/sales/quotations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sales Quotations", description = "Quotation management for Sales")
public class QuotationController {
    
    private final QuotationService quotationService;
    
    @GetMapping
    @Operation(summary = "Get all quotations for an organization")
    public ResponseEntity<List<Quotation>> getAllQuotations(
            @RequestParam("organizationId") UUID organizationId,
            @RequestParam(value = "status", required = false) String status) {
        
        log.info("GET /api/sales/quotations - organizationId: {}, status: {}", organizationId, status);
        
        List<Quotation> quotations = status != null 
                ? quotationService.getQuotationsByStatus(organizationId, status)
                : quotationService.getAllQuotations(organizationId);
        
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get quotations for a specific customer")
    public ResponseEntity<List<Quotation>> getQuotationsByCustomer(
            @RequestParam("organizationId") UUID organizationId,
            @PathVariable("customerId") UUID customerId) {
        
        log.info("GET /api/sales/quotations/customer/{} - organizationId: {}", customerId, organizationId);
        
        List<Quotation> quotations = quotationService.getQuotationsByCustomer(organizationId, customerId);
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get quotation by ID")
    public ResponseEntity<Quotation> getQuotationById(@PathVariable("id") UUID id) {
        log.info("GET /api/sales/quotations/{}", id);
        return ResponseEntity.ok(quotationService.getQuotationById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new quotation")
    public ResponseEntity<Quotation> createQuotation(@Valid @RequestBody QuotationRequest request) {
        log.info("POST /api/sales/quotations - Creating quotation for organization: {}", request.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationService.createQuotation(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update quotation")
    public ResponseEntity<Quotation> updateQuotation(
            @PathVariable("id") UUID id,
            @Valid @RequestBody QuotationRequest request) {
        log.info("PUT /api/sales/quotations/{}", id);
        return ResponseEntity.ok(quotationService.updateQuotation(id, request));
    }
    
    @PostMapping("/{id}/send")
    @Operation(summary = "Send quotation to customer")
    public ResponseEntity<Quotation> sendQuotation(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/quotations/{}/send", id);
        return ResponseEntity.ok(quotationService.sendQuotation(id));
    }
    
    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept quotation")
    public ResponseEntity<Quotation> acceptQuotation(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/quotations/{}/accept", id);
        return ResponseEntity.ok(quotationService.acceptQuotation(id));
    }
    
    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject quotation")
    public ResponseEntity<Quotation> rejectQuotation(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/quotations/{}/reject", id);
        return ResponseEntity.ok(quotationService.rejectQuotation(id));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete quotation")
    public ResponseEntity<Void> deleteQuotation(@PathVariable("id") UUID id) {
        log.info("DELETE /api/sales/quotations/{}", id);
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/expire-old")
    @Operation(summary = "Expire old quotations")
    public ResponseEntity<Void> expireOldQuotations(@RequestParam("organizationId") UUID organizationId) {
        log.info("POST /api/sales/quotations/expire-old - organizationId: {}", organizationId);
        quotationService.expireOldQuotations(organizationId);
        return ResponseEntity.ok().build();
    }
}


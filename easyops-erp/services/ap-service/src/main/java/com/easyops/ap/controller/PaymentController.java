package com.easyops.ap.controller;

import com.easyops.ap.dto.PaymentRequest;
import com.easyops.ap.entity.APPayment;
import com.easyops.ap.service.PaymentService;
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
@RequestMapping("/api/ap/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AP Payments", description = "Payment management for Accounts Payable")
public class PaymentController {
    private final PaymentService paymentService;
    
    @GetMapping
    @Operation(summary = "Get all payments for an organization")
    public ResponseEntity<List<APPayment>> getAllPayments(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        List<APPayment> payments = status != null 
                ? paymentService.getPaymentsByStatus(organizationId, status)
                : paymentService.getAllPayments(organizationId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<APPayment> getPaymentById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new payment")
    public ResponseEntity<APPayment> createPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createPayment(request));
    }
    
    @PostMapping("/{id}/post")
    @Operation(summary = "Post payment")
    public ResponseEntity<APPayment> postPayment(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.postPayment(id));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete payment")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}


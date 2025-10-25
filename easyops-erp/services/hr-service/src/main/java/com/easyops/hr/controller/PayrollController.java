package com.easyops.hr.controller;

import com.easyops.hr.entity.PayrollDetail;
import com.easyops.hr.entity.PayrollRun;
import com.easyops.hr.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/payroll")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PayrollController {
    
    private final PayrollService payrollService;
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPayrollStats(@RequestParam UUID organizationId) {
        log.info("GET /payroll/stats - organizationId: {}", organizationId);
        Map<String, Object> stats = payrollService.getPayrollStats(organizationId);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/runs")
    public ResponseEntity<List<PayrollRun>> getAllPayrollRuns(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /payroll/runs - organizationId: {}, status: {}", organizationId, status);
        
        List<PayrollRun> runs;
        
        if (status != null) {
            runs = payrollService.getPayrollRunsByStatus(organizationId, status);
        } else {
            runs = payrollService.getAllPayrollRuns(organizationId);
        }
        
        return ResponseEntity.ok(runs);
    }
    
    @GetMapping("/runs/{id}")
    public ResponseEntity<PayrollRun> getPayrollRunById(@PathVariable UUID id) {
        log.info("GET /payroll/runs/{}", id);
        PayrollRun run = payrollService.getPayrollRunById(id);
        return ResponseEntity.ok(run);
    }
    
    @PostMapping("/runs")
    public ResponseEntity<PayrollRun> createPayrollRun(@RequestBody PayrollRun payrollRun) {
        log.info("POST /payroll/runs - Creating payroll run: {}", payrollRun.getRunName());
        PayrollRun created = payrollService.createPayrollRun(payrollRun);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/runs/{id}")
    public ResponseEntity<PayrollRun> updatePayrollRun(
            @PathVariable UUID id,
            @RequestBody PayrollRun payrollRun) {
        log.info("PUT /payroll/runs/{}", id);
        PayrollRun updated = payrollService.updatePayrollRun(id, payrollRun);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/runs/{id}/process")
    public ResponseEntity<PayrollRun> processPayrollRun(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID processedBy = UUID.fromString(request.get("processedBy"));
        log.info("POST /payroll/runs/{}/process - processedBy: {}", id, processedBy);
        PayrollRun processed = payrollService.processPayrollRun(id, processedBy);
        return ResponseEntity.ok(processed);
    }
    
    @PostMapping("/runs/{id}/approve")
    public ResponseEntity<PayrollRun> approvePayrollRun(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy"));
        log.info("POST /payroll/runs/{}/approve - approvedBy: {}", id, approvedBy);
        PayrollRun approved = payrollService.approvePayrollRun(id, approvedBy);
        return ResponseEntity.ok(approved);
    }
    
    @GetMapping("/runs/{id}/details")
    public ResponseEntity<List<PayrollDetail>> getPayrollDetails(@PathVariable UUID id) {
        log.info("GET /payroll/runs/{}/details", id);
        List<PayrollDetail> details = payrollService.getPayrollDetails(id);
        return ResponseEntity.ok(details);
    }
    
    @PostMapping("/details")
    public ResponseEntity<PayrollDetail> createPayrollDetail(@RequestBody PayrollDetail detail) {
        log.info("POST /payroll/details - Creating payroll detail");
        PayrollDetail created = payrollService.createPayrollDetail(detail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/details/employee/{employeeId}")
    public ResponseEntity<List<PayrollDetail>> getEmployeePayrollHistory(
            @PathVariable UUID employeeId,
            @RequestParam UUID organizationId) {
        
        log.info("GET /payroll/details/employee/{}", employeeId);
        List<PayrollDetail> history = payrollService.getEmployeePayrollHistory(employeeId, organizationId);
        return ResponseEntity.ok(history);
    }
    
    @PostMapping("/details/{id}/mark-paid")
    public ResponseEntity<PayrollDetail> markAsPaid(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        String paymentReference = request.get("paymentReference");
        log.info("POST /payroll/details/{}/mark-paid", id);
        PayrollDetail updated = payrollService.markAsPaid(id, paymentReference);
        return ResponseEntity.ok(updated);
    }
}


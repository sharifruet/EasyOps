package com.easyops.hr.controller;

import com.easyops.hr.entity.Bonus;
import com.easyops.hr.entity.Reimbursement;
import com.easyops.hr.service.CompensationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/compensation")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CompensationController {
    
    private final CompensationService compensationService;
    
    // Reimbursements
    @GetMapping("/reimbursements")
    public ResponseEntity<List<Reimbursement>> getAllReimbursements(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /compensation/reimbursements - organizationId: {}, employeeId: {}, status: {}", 
                organizationId, employeeId, status);
        
        List<Reimbursement> reimbursements;
        
        if (status != null && "pending".equals(status)) {
            reimbursements = compensationService.getPendingReimbursements(organizationId);
        } else if (employeeId != null) {
            reimbursements = compensationService.getEmployeeReimbursements(employeeId, organizationId);
        } else {
            reimbursements = compensationService.getAllReimbursements(organizationId);
        }
        
        return ResponseEntity.ok(reimbursements);
    }
    
    @PostMapping("/reimbursements")
    public ResponseEntity<Reimbursement> createReimbursement(@RequestBody Reimbursement reimbursement) {
        log.info("POST /compensation/reimbursements - Creating reimbursement");
        Reimbursement created = compensationService.createReimbursement(reimbursement);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/reimbursements/{id}/approve")
    public ResponseEntity<Reimbursement> approveReimbursement(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy"));
        log.info("POST /compensation/reimbursements/{}/approve - approvedBy: {}", id, approvedBy);
        Reimbursement approved = compensationService.approveReimbursement(id, approvedBy);
        return ResponseEntity.ok(approved);
    }
    
    @PostMapping("/reimbursements/{id}/reject")
    public ResponseEntity<Reimbursement> rejectReimbursement(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID rejectedBy = UUID.fromString(request.get("rejectedBy"));
        String rejectionReason = request.get("rejectionReason");
        
        log.info("POST /compensation/reimbursements/{}/reject - rejectedBy: {}", id, rejectedBy);
        Reimbursement rejected = compensationService.rejectReimbursement(id, rejectedBy, rejectionReason);
        return ResponseEntity.ok(rejected);
    }
    
    // Bonuses
    @GetMapping("/bonuses")
    public ResponseEntity<List<Bonus>> getAllBonuses(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /compensation/bonuses - organizationId: {}, employeeId: {}, status: {}", 
                organizationId, employeeId, status);
        
        List<Bonus> bonuses;
        
        if (status != null && "pending".equals(status)) {
            bonuses = compensationService.getPendingBonuses(organizationId);
        } else if (employeeId != null) {
            bonuses = compensationService.getEmployeeBonuses(employeeId, organizationId);
        } else {
            bonuses = compensationService.getAllBonuses(organizationId);
        }
        
        return ResponseEntity.ok(bonuses);
    }
    
    @PostMapping("/bonuses")
    public ResponseEntity<Bonus> createBonus(@RequestBody Bonus bonus) {
        log.info("POST /compensation/bonuses - Creating bonus");
        Bonus created = compensationService.createBonus(bonus);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/bonuses/{id}/approve")
    public ResponseEntity<Bonus> approveBonus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy"));
        log.info("POST /compensation/bonuses/{}/approve - approvedBy: {}", id, approvedBy);
        Bonus approved = compensationService.approveBonus(id, approvedBy);
        return ResponseEntity.ok(approved);
    }
}


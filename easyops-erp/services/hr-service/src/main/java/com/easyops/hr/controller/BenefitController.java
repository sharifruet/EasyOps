package com.easyops.hr.controller;

import com.easyops.hr.entity.Benefit;
import com.easyops.hr.entity.EmployeeBenefit;
import com.easyops.hr.service.BenefitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/benefits")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class BenefitController {
    
    private final BenefitService benefitService;
    
    @GetMapping
    public ResponseEntity<List<Benefit>> getAllBenefits(@RequestParam UUID organizationId) {
        log.info("GET /benefits - organizationId: {}", organizationId);
        List<Benefit> benefits = benefitService.getAllBenefits(organizationId);
        return ResponseEntity.ok(benefits);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Benefit> getBenefitById(@PathVariable UUID id) {
        log.info("GET /benefits/{}", id);
        Benefit benefit = benefitService.getBenefitById(id);
        return ResponseEntity.ok(benefit);
    }
    
    @PostMapping
    public ResponseEntity<Benefit> createBenefit(@RequestBody Benefit benefit) {
        log.info("POST /benefits - Creating benefit: {}", benefit.getBenefitName());
        Benefit created = benefitService.createBenefit(benefit);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Benefit> updateBenefit(
            @PathVariable UUID id,
            @RequestBody Benefit benefit) {
        log.info("PUT /benefits/{}", id);
        Benefit updated = benefitService.updateBenefit(id, benefit);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/enrollments")
    public ResponseEntity<List<EmployeeBenefit>> getEmployeeBenefits(
            @RequestParam UUID employeeId,
            @RequestParam UUID organizationId) {
        
        log.info("GET /benefits/enrollments - employeeId: {}", employeeId);
        List<EmployeeBenefit> enrollments = benefitService.getEmployeeBenefits(employeeId, organizationId);
        return ResponseEntity.ok(enrollments);
    }
    
    @PostMapping("/enrollments")
    public ResponseEntity<EmployeeBenefit> enrollBenefit(@RequestBody EmployeeBenefit enrollment) {
        log.info("POST /benefits/enrollments - Enrolling employee: {}", enrollment.getEmployeeId());
        EmployeeBenefit created = benefitService.enrollBenefit(enrollment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/enrollments/{id}")
    public ResponseEntity<EmployeeBenefit> updateBenefitEnrollment(
            @PathVariable UUID id,
            @RequestBody EmployeeBenefit enrollment) {
        log.info("PUT /benefits/enrollments/{}", id);
        EmployeeBenefit updated = benefitService.updateBenefitEnrollment(id, enrollment);
        return ResponseEntity.ok(updated);
    }
}


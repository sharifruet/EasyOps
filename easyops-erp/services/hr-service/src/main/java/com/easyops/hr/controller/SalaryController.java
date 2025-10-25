package com.easyops.hr.controller;

import com.easyops.hr.entity.EmployeeSalaryDetail;
import com.easyops.hr.entity.SalaryComponent;
import com.easyops.hr.entity.SalaryStructure;
import com.easyops.hr.service.SalaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/salary")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SalaryController {
    
    private final SalaryService salaryService;
    
    // Salary Structures
    @GetMapping("/structures")
    public ResponseEntity<List<SalaryStructure>> getAllSalaryStructures(@RequestParam UUID organizationId) {
        log.info("GET /salary/structures - organizationId: {}", organizationId);
        List<SalaryStructure> structures = salaryService.getAllSalaryStructures(organizationId);
        return ResponseEntity.ok(structures);
    }
    
    @PostMapping("/structures")
    public ResponseEntity<SalaryStructure> createSalaryStructure(@RequestBody SalaryStructure structure) {
        log.info("POST /salary/structures - Creating structure: {}", structure.getStructureName());
        SalaryStructure created = salaryService.createSalaryStructure(structure);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/structures/{id}")
    public ResponseEntity<SalaryStructure> updateSalaryStructure(
            @PathVariable UUID id,
            @RequestBody SalaryStructure structure) {
        log.info("PUT /salary/structures/{}", id);
        SalaryStructure updated = salaryService.updateSalaryStructure(id, structure);
        return ResponseEntity.ok(updated);
    }
    
    // Salary Components
    @GetMapping("/components")
    public ResponseEntity<List<SalaryComponent>> getAllSalaryComponents(@RequestParam UUID organizationId) {
        log.info("GET /salary/components - organizationId: {}", organizationId);
        List<SalaryComponent> components = salaryService.getAllSalaryComponents(organizationId);
        return ResponseEntity.ok(components);
    }
    
    @PostMapping("/components")
    public ResponseEntity<SalaryComponent> createSalaryComponent(@RequestBody SalaryComponent component) {
        log.info("POST /salary/components - Creating component: {}", component.getComponentName());
        SalaryComponent created = salaryService.createSalaryComponent(component);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/components/{id}")
    public ResponseEntity<SalaryComponent> updateSalaryComponent(
            @PathVariable UUID id,
            @RequestBody SalaryComponent component) {
        log.info("PUT /salary/components/{}", id);
        SalaryComponent updated = salaryService.updateSalaryComponent(id, component);
        return ResponseEntity.ok(updated);
    }
    
    // Employee Salary Details
    @GetMapping("/details")
    public ResponseEntity<List<EmployeeSalaryDetail>> getAllEmployeeSalaryDetails(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId) {
        
        log.info("GET /salary/details - organizationId: {}, employeeId: {}", organizationId, employeeId);
        
        List<EmployeeSalaryDetail> details;
        if (employeeId != null) {
            details = salaryService.getEmployeeSalaryDetails(employeeId, organizationId);
        } else {
            details = salaryService.getAllEmployeeSalaryDetails(organizationId);
        }
        
        return ResponseEntity.ok(details);
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeSalaryDetail>> getEmployeeSalaryDetails(
            @PathVariable UUID employeeId,
            @RequestParam UUID organizationId) {
        
        log.info("GET /salary/employee/{}", employeeId);
        List<EmployeeSalaryDetail> details = salaryService.getEmployeeSalaryDetails(employeeId, organizationId);
        return ResponseEntity.ok(details);
    }
    
    @PostMapping("/employee/details")
    public ResponseEntity<EmployeeSalaryDetail> createEmployeeSalaryDetail(@RequestBody EmployeeSalaryDetail detail) {
        log.info("POST /salary/employee/details - Creating detail for employee: {}", detail.getEmployeeId());
        EmployeeSalaryDetail created = salaryService.createEmployeeSalaryDetail(detail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}


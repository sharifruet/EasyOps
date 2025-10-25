package com.easyops.hr.controller;

import com.easyops.hr.entity.Department;
import com.easyops.hr.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/departments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DepartmentController {
    
    private final DepartmentService departmentService;
    
    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) UUID parentDepartmentId) {
        
        log.info("GET /departments - organizationId: {}, activeOnly: {}, parentDepartmentId: {}", 
                organizationId, activeOnly, parentDepartmentId);
        
        List<Department> departments;
        
        if (parentDepartmentId != null) {
            departments = departmentService.getChildDepartments(organizationId, parentDepartmentId);
        } else if (Boolean.TRUE.equals(activeOnly)) {
            departments = departmentService.getActiveDepartments(organizationId);
        } else {
            departments = departmentService.getAllDepartments(organizationId);
        }
        
        return ResponseEntity.ok(departments);
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<Department>> getRootDepartments(@RequestParam UUID organizationId) {
        log.info("GET /departments/root - organizationId: {}", organizationId);
        List<Department> departments = departmentService.getRootDepartments(organizationId);
        return ResponseEntity.ok(departments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable UUID id) {
        log.info("GET /departments/{}", id);
        Department department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(department);
    }
    
    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        log.info("POST /departments - Creating department: {}", department.getName());
        Department createdDepartment = departmentService.createDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable UUID id,
            @RequestBody Department department) {
        log.info("PUT /departments/{}", id);
        Department updatedDepartment = departmentService.updateDepartment(id, department);
        return ResponseEntity.ok(updatedDepartment);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable UUID id) {
        log.info("DELETE /departments/{}", id);
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}


package com.easyops.hr.controller;

import com.easyops.hr.entity.Employee;
import com.easyops.hr.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    private final EmployeeService employeeService;
    
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String search) {
        
        log.info("GET /employees - organizationId: {}, status: {}, departmentId: {}, search: {}", 
                organizationId, status, departmentId, search);
        
        List<Employee> employees;
        
        if (search != null && !search.isEmpty()) {
            employees = employeeService.searchEmployees(organizationId, search);
        } else if (departmentId != null) {
            employees = employeeService.getEmployeesByDepartment(organizationId, departmentId);
        } else if (status != null) {
            employees = employeeService.getEmployeesByStatus(organizationId, status);
        } else {
            employees = employeeService.getAllEmployees(organizationId);
        }
        
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable UUID id) {
        log.info("GET /employees/{}", id);
        Employee employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(employee);
    }
    
    @GetMapping("/number/{employeeNumber}")
    public ResponseEntity<Employee> getEmployeeByNumber(
            @PathVariable String employeeNumber,
            @RequestParam UUID organizationId) {
        log.info("GET /employees/number/{} - organizationId: {}", employeeNumber, organizationId);
        Employee employee = employeeService.getEmployeeByNumber(organizationId, employeeNumber);
        return ResponseEntity.ok(employee);
    }
    
    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        log.info("POST /employees - Creating employee: {} {}", employee.getFirstName(), employee.getLastName());
        Employee createdEmployee = employeeService.createEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable UUID id,
            @RequestBody Employee employee) {
        log.info("PUT /employees/{}", id);
        Employee updatedEmployee = employeeService.updateEmployee(id, employee);
        return ResponseEntity.ok(updatedEmployee);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        log.info("DELETE /employees/{}", id);
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/count")
    public ResponseEntity<Long> countEmployees(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        log.info("GET /employees/count - organizationId: {}, status: {}", organizationId, status);
        
        long count;
        if (status != null) {
            count = employeeService.countEmployeesByStatus(organizationId, status);
        } else {
            count = employeeService.getAllEmployees(organizationId).size();
        }
        
        return ResponseEntity.ok(count);
    }
}


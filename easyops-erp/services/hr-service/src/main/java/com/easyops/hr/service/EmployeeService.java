package com.easyops.hr.service;

import com.easyops.hr.entity.Employee;
import com.easyops.hr.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    
    public List<Employee> getAllEmployees(UUID organizationId) {
        log.debug("Fetching all employees for organization: {}", organizationId);
        return employeeRepository.findByOrganizationId(organizationId);
    }
    
    public List<Employee> getEmployeesByStatus(UUID organizationId, String status) {
        log.debug("Fetching employees for organization: {} with status: {}", organizationId, status);
        return employeeRepository.findByOrganizationIdAndEmploymentStatus(organizationId, status);
    }
    
    public List<Employee> getEmployeesByDepartment(UUID organizationId, UUID departmentId) {
        log.debug("Fetching employees for organization: {} in department: {}", organizationId, departmentId);
        return employeeRepository.findByOrganizationIdAndDepartmentId(organizationId, departmentId);
    }
    
    public List<Employee> searchEmployees(UUID organizationId, String search) {
        log.debug("Searching employees for organization: {} with term: {}", organizationId, search);
        return employeeRepository.searchEmployees(organizationId, search);
    }
    
    public Employee getEmployeeById(UUID employeeId) {
        log.debug("Fetching employee by ID: {}", employeeId);
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
    }
    
    public Employee getEmployeeByNumber(UUID organizationId, String employeeNumber) {
        log.debug("Fetching employee by number: {} for organization: {}", employeeNumber, organizationId);
        return employeeRepository.findByOrganizationIdAndEmployeeNumber(organizationId, employeeNumber)
                .orElseThrow(() -> new RuntimeException("Employee not found with number: " + employeeNumber));
    }
    
    public Employee createEmployee(Employee employee) {
        log.info("Creating new employee: {} {} for organization: {}", 
                employee.getFirstName(), employee.getLastName(), employee.getOrganizationId());
        
        // Check for duplicate employee number
        employeeRepository.findByOrganizationIdAndEmployeeNumber(
                employee.getOrganizationId(), employee.getEmployeeNumber())
                .ifPresent(e -> {
                    throw new RuntimeException("Employee number already exists: " + employee.getEmployeeNumber());
                });
        
        // Check for duplicate email
        employeeRepository.findByOrganizationIdAndEmail(
                employee.getOrganizationId(), employee.getEmail())
                .ifPresent(e -> {
                    throw new RuntimeException("Email already exists: " + employee.getEmail());
                });
        
        return employeeRepository.save(employee);
    }
    
    public Employee updateEmployee(UUID employeeId, Employee employeeData) {
        log.info("Updating employee: {}", employeeId);
        
        Employee existingEmployee = getEmployeeById(employeeId);
        
        // Update fields
        existingEmployee.setFirstName(employeeData.getFirstName());
        existingEmployee.setLastName(employeeData.getLastName());
        existingEmployee.setEmail(employeeData.getEmail());
        existingEmployee.setPhone(employeeData.getPhone());
        existingEmployee.setDateOfBirth(employeeData.getDateOfBirth());
        existingEmployee.setGender(employeeData.getGender());
        existingEmployee.setDepartmentId(employeeData.getDepartmentId());
        existingEmployee.setPositionId(employeeData.getPositionId());
        existingEmployee.setManagerId(employeeData.getManagerId());
        existingEmployee.setEmploymentType(employeeData.getEmploymentType());
        existingEmployee.setEmploymentStatus(employeeData.getEmploymentStatus());
        
        // Address fields
        existingEmployee.setAddressLine1(employeeData.getAddressLine1());
        existingEmployee.setAddressLine2(employeeData.getAddressLine2());
        existingEmployee.setCity(employeeData.getCity());
        existingEmployee.setStateProvince(employeeData.getStateProvince());
        existingEmployee.setPostalCode(employeeData.getPostalCode());
        existingEmployee.setCountry(employeeData.getCountry());
        
        // Emergency contact
        existingEmployee.setEmergencyContactName(employeeData.getEmergencyContactName());
        existingEmployee.setEmergencyContactPhone(employeeData.getEmergencyContactPhone());
        existingEmployee.setEmergencyContactRelationship(employeeData.getEmergencyContactRelationship());
        
        existingEmployee.setUpdatedBy(employeeData.getUpdatedBy());
        
        return employeeRepository.save(existingEmployee);
    }
    
    public void deleteEmployee(UUID employeeId) {
        log.info("Deactivating employee: {}", employeeId);
        Employee employee = getEmployeeById(employeeId);
        employee.setIsActive(false);
        employee.setEmploymentStatus("TERMINATED");
        employeeRepository.save(employee);
    }
    
    public long countEmployeesByStatus(UUID organizationId, String status) {
        return employeeRepository.countByOrganizationIdAndEmploymentStatus(organizationId, status);
    }
}


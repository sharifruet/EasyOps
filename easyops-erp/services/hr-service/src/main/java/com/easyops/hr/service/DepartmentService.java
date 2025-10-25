package com.easyops.hr.service;

import com.easyops.hr.entity.Department;
import com.easyops.hr.repository.DepartmentRepository;
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
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    
    public List<Department> getAllDepartments(UUID organizationId) {
        log.debug("Fetching all departments for organization: {}", organizationId);
        return departmentRepository.findByOrganizationId(organizationId);
    }
    
    public List<Department> getActiveDepartments(UUID organizationId) {
        log.debug("Fetching active departments for organization: {}", organizationId);
        return departmentRepository.findByOrganizationIdAndIsActive(organizationId, true);
    }
    
    public List<Department> getRootDepartments(UUID organizationId) {
        log.debug("Fetching root departments for organization: {}", organizationId);
        return departmentRepository.findByOrganizationIdAndParentDepartmentIdIsNull(organizationId);
    }
    
    public List<Department> getChildDepartments(UUID organizationId, UUID parentDepartmentId) {
        log.debug("Fetching child departments for parent: {}", parentDepartmentId);
        return departmentRepository.findByOrganizationIdAndParentDepartmentId(organizationId, parentDepartmentId);
    }
    
    public Department getDepartmentById(UUID departmentId) {
        log.debug("Fetching department by ID: {}", departmentId);
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));
    }
    
    public Department createDepartment(Department department) {
        log.info("Creating new department: {} for organization: {}", 
                department.getName(), department.getOrganizationId());
        
        // Check for duplicate name
        departmentRepository.findByOrganizationIdAndName(
                department.getOrganizationId(), department.getName())
                .ifPresent(d -> {
                    throw new RuntimeException("Department name already exists: " + department.getName());
                });
        
        return departmentRepository.save(department);
    }
    
    public Department updateDepartment(UUID departmentId, Department departmentData) {
        log.info("Updating department: {}", departmentId);
        
        Department existingDepartment = getDepartmentById(departmentId);
        
        // Update fields
        existingDepartment.setName(departmentData.getName());
        existingDepartment.setDescription(departmentData.getDescription());
        existingDepartment.setManagerId(departmentData.getManagerId());
        existingDepartment.setParentDepartmentId(departmentData.getParentDepartmentId());
        existingDepartment.setIsActive(departmentData.getIsActive());
        existingDepartment.setUpdatedBy(departmentData.getUpdatedBy());
        
        return departmentRepository.save(existingDepartment);
    }
    
    public void deleteDepartment(UUID departmentId) {
        log.info("Deactivating department: {}", departmentId);
        Department department = getDepartmentById(departmentId);
        department.setIsActive(false);
        departmentRepository.save(department);
    }
}


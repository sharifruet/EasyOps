package com.easyops.hr.service;

import com.easyops.hr.entity.EmployeeSalaryDetail;
import com.easyops.hr.entity.SalaryComponent;
import com.easyops.hr.entity.SalaryStructure;
import com.easyops.hr.repository.EmployeeSalaryDetailRepository;
import com.easyops.hr.repository.SalaryComponentRepository;
import com.easyops.hr.repository.SalaryStructureRepository;
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
public class SalaryService {
    
    private final SalaryStructureRepository salaryStructureRepository;
    private final SalaryComponentRepository salaryComponentRepository;
    private final EmployeeSalaryDetailRepository employeeSalaryDetailRepository;
    
    // Salary Structure Methods
    public List<SalaryStructure> getAllSalaryStructures(UUID organizationId) {
        return salaryStructureRepository.findByOrganizationId(organizationId);
    }
    
    public SalaryStructure createSalaryStructure(SalaryStructure structure) {
        log.info("Creating salary structure: {}", structure.getStructureName());
        return salaryStructureRepository.save(structure);
    }
    
    public SalaryStructure updateSalaryStructure(UUID structureId, SalaryStructure structure) {
        SalaryStructure existing = salaryStructureRepository.findById(structureId)
                .orElseThrow(() -> new RuntimeException("Salary structure not found"));
        
        if (structure.getStructureName() != null) existing.setStructureName(structure.getStructureName());
        if (structure.getBaseSalary() != null) existing.setBaseSalary(structure.getBaseSalary());
        if (structure.getPayFrequency() != null) existing.setPayFrequency(structure.getPayFrequency());
        if (structure.getIsActive() != null) existing.setIsActive(structure.getIsActive());
        
        return salaryStructureRepository.save(existing);
    }
    
    // Salary Component Methods
    public List<SalaryComponent> getAllSalaryComponents(UUID organizationId) {
        return salaryComponentRepository.findByOrganizationId(organizationId);
    }
    
    public SalaryComponent createSalaryComponent(SalaryComponent component) {
        log.info("Creating salary component: {}", component.getComponentName());
        return salaryComponentRepository.save(component);
    }
    
    public SalaryComponent updateSalaryComponent(UUID componentId, SalaryComponent component) {
        SalaryComponent existing = salaryComponentRepository.findById(componentId)
                .orElseThrow(() -> new RuntimeException("Salary component not found"));
        
        if (component.getComponentName() != null) existing.setComponentName(component.getComponentName());
        if (component.getComponentType() != null) existing.setComponentType(component.getComponentType());
        if (component.getCalculationType() != null) existing.setCalculationType(component.getCalculationType());
        if (component.getIsTaxable() != null) existing.setIsTaxable(component.getIsTaxable());
        if (component.getIsActive() != null) existing.setIsActive(component.getIsActive());
        
        return salaryComponentRepository.save(existing);
    }
    
    // Employee Salary Detail Methods
    public List<EmployeeSalaryDetail> getAllEmployeeSalaryDetails(UUID organizationId) {
        return employeeSalaryDetailRepository.findByOrganizationId(organizationId);
    }
    
    public List<EmployeeSalaryDetail> getEmployeeSalaryDetails(UUID employeeId, UUID organizationId) {
        return employeeSalaryDetailRepository.findByEmployeeIdAndOrganizationId(employeeId, organizationId);
    }
    
    public EmployeeSalaryDetail createEmployeeSalaryDetail(EmployeeSalaryDetail detail) {
        log.info("Creating employee salary detail for employee: {}", detail.getEmployeeId());
        return employeeSalaryDetailRepository.save(detail);
    }
}


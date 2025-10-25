package com.easyops.hr.repository;

import com.easyops.hr.entity.EmployeeSalaryDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeSalaryDetailRepository extends JpaRepository<EmployeeSalaryDetail, UUID> {
    
    List<EmployeeSalaryDetail> findByEmployeeIdAndOrganizationId(UUID employeeId, UUID organizationId);
    
    List<EmployeeSalaryDetail> findByEmployeeIdAndIsActive(UUID employeeId, Boolean isActive);
}


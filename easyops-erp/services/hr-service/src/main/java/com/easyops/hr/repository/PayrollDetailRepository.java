package com.easyops.hr.repository;

import com.easyops.hr.entity.PayrollDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollDetailRepository extends JpaRepository<PayrollDetail, UUID> {
    
    List<PayrollDetail> findByPayrollRunId(UUID payrollRunId);
    
    List<PayrollDetail> findByEmployeeIdAndOrganizationId(UUID employeeId, UUID organizationId);
    
    List<PayrollDetail> findByPayrollRunIdAndStatus(UUID payrollRunId, String status);
}


package com.easyops.hr.repository;

import com.easyops.hr.entity.PayrollComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollComponentRepository extends JpaRepository<PayrollComponent, UUID> {
    
    List<PayrollComponent> findByPayrollDetailId(UUID payrollDetailId);
    
    void deleteByPayrollDetailId(UUID payrollDetailId);
}


package com.easyops.hr.repository;

import com.easyops.hr.entity.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {
    
    List<PayrollRun> findByOrganizationId(UUID organizationId);
    
    List<PayrollRun> findByOrganizationIdAndStatus(UUID organizationId, String status);
    
    List<PayrollRun> findByOrganizationIdOrderByPayPeriodStartDesc(UUID organizationId);
    
    @Query("SELECT pr FROM PayrollRun pr WHERE pr.organizationId = :organizationId " +
           "AND pr.payPeriodStart >= :startDate AND pr.payPeriodEnd <= :endDate")
    List<PayrollRun> findPayrollRunsInRange(@Param("organizationId") UUID organizationId,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);
}


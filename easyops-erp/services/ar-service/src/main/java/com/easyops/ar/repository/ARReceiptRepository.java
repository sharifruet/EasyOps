package com.easyops.ar.repository;

import com.easyops.ar.entity.ARReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ARReceiptRepository extends JpaRepository<ARReceipt, UUID> {
    
    List<ARReceipt> findByOrganizationId(UUID organizationId);
    
    List<ARReceipt> findByOrganizationIdAndStatus(UUID organizationId, String status);
    
    Optional<ARReceipt> findByReceiptNumber(String receiptNumber);
    
    List<ARReceipt> findByCustomerId(UUID customerId);
    
    @Query("SELECT r FROM ARReceipt r WHERE r.organizationId = :orgId AND r.status = 'POSTED'")
    List<ARReceipt> findPostedReceipts(@Param("orgId") UUID organizationId);
    
    boolean existsByReceiptNumber(String receiptNumber);
}


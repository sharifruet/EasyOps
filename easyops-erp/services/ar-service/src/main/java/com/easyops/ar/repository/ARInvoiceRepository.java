package com.easyops.ar.repository;

import com.easyops.ar.entity.ARInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ARInvoiceRepository extends JpaRepository<ARInvoice, UUID> {
    
    List<ARInvoice> findByOrganizationId(UUID organizationId);
    
    List<ARInvoice> findByOrganizationIdAndStatus(UUID organizationId, String status);
    
    List<ARInvoice> findByOrganizationIdAndPaymentStatus(UUID organizationId, String paymentStatus);
    
    Optional<ARInvoice> findByInvoiceNumber(String invoiceNumber);
    
    List<ARInvoice> findByCustomerId(UUID customerId);
    
    @Query("SELECT i FROM ARInvoice i WHERE i.organizationId = :orgId AND i.status = 'POSTED' AND i.balanceDue > 0")
    List<ARInvoice> findOutstandingInvoices(@Param("orgId") UUID organizationId);
    
    @Query("SELECT i FROM ARInvoice i WHERE i.organizationId = :orgId AND i.dueDate < :date AND i.balanceDue > 0")
    List<ARInvoice> findOverdueInvoices(@Param("orgId") UUID organizationId, @Param("date") LocalDate date);
    
    boolean existsByInvoiceNumber(String invoiceNumber);
}


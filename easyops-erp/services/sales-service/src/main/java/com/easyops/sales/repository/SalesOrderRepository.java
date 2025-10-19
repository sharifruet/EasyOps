package com.easyops.sales.repository;

import com.easyops.sales.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, UUID> {
    
    List<SalesOrder> findByOrganizationIdOrderByOrderDateDesc(UUID organizationId);
    
    List<SalesOrder> findByOrganizationIdAndStatus(UUID organizationId, String status);
    
    List<SalesOrder> findByOrganizationIdAndCustomerId(UUID organizationId, UUID customerId);
    
    List<SalesOrder> findByOrganizationIdAndPaymentStatus(UUID organizationId, String paymentStatus);
    
    List<SalesOrder> findByOrganizationIdAndDeliveryStatus(UUID organizationId, String deliveryStatus);
    
    Optional<SalesOrder> findByOrganizationIdAndOrderNumber(UUID organizationId, String orderNumber);
    
    Optional<SalesOrder> findByQuotationId(UUID quotationId);
    
    @Query("SELECT so FROM SalesOrder so WHERE so.organizationId = :orgId AND so.orderDate BETWEEN :startDate AND :endDate ORDER BY so.orderDate DESC")
    List<SalesOrder> findByDateRange(@Param("orgId") UUID organizationId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT so FROM SalesOrder so WHERE so.organizationId = :orgId AND so.status = 'CONFIRMED' AND so.deliveryStatus != 'DELIVERED'")
    List<SalesOrder> findPendingDeliveries(@Param("orgId") UUID organizationId);
    
    @Query("SELECT so FROM SalesOrder so WHERE so.organizationId = :orgId AND so.status IN ('CONFIRMED', 'IN_PROGRESS', 'COMPLETED') AND so.convertedToInvoiceId IS NULL")
    List<SalesOrder> findOrdersReadyForInvoicing(@Param("orgId") UUID organizationId);
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(so.orderNumber, LENGTH(:prefix) + 1) AS INTEGER)), 0) FROM SalesOrder so WHERE so.organizationId = :orgId AND so.orderNumber LIKE CONCAT(:prefix, '%')")
    Integer findMaxOrderNumber(@Param("orgId") UUID organizationId, @Param("prefix") String prefix);
    
    boolean existsByOrganizationIdAndOrderNumber(UUID organizationId, String orderNumber);
}


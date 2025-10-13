package com.easyops.notification.repository;

import com.easyops.notification.entity.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, UUID> {
    
    List<Webhook> findByOrganizationId(UUID organizationId);
    
    List<Webhook> findByOrganizationIdAndIsActive(UUID organizationId, Boolean isActive);
    
    @Query("SELECT w FROM Webhook w WHERE w.organizationId = :orgId AND w.isActive = true AND :eventType = ANY(w.events)")
    List<Webhook> findActiveWebhooksForEvent(@Param("orgId") UUID organizationId, @Param("eventType") String eventType);
}


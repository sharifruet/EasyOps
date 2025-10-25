package com.easyops.hr.repository;

import com.easyops.hr.entity.TaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlab, UUID> {
    
    List<TaxSlab> findByOrganizationId(UUID organizationId);
    
    List<TaxSlab> findByOrganizationIdAndEffectiveYearAndIsActive(
            UUID organizationId, Integer effectiveYear, Boolean isActive);
}


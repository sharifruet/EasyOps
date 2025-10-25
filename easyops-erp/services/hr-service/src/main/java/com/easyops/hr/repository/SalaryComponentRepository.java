package com.easyops.hr.repository;

import com.easyops.hr.entity.SalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, UUID> {
    
    List<SalaryComponent> findByOrganizationId(UUID organizationId);
    
    List<SalaryComponent> findByOrganizationIdAndIsActive(UUID organizationId, Boolean isActive);
    
    List<SalaryComponent> findByOrganizationIdAndComponentType(UUID organizationId, String componentType);
}


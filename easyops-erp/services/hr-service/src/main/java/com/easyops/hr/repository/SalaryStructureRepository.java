package com.easyops.hr.repository;

import com.easyops.hr.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, UUID> {
    
    List<SalaryStructure> findByOrganizationId(UUID organizationId);
    
    List<SalaryStructure> findByOrganizationIdAndIsActive(UUID organizationId, Boolean isActive);
    
    List<SalaryStructure> findByPositionId(UUID positionId);
}


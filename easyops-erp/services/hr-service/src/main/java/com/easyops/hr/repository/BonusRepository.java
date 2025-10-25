package com.easyops.hr.repository;

import com.easyops.hr.entity.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BonusRepository extends JpaRepository<Bonus, UUID> {
    
    List<Bonus> findByOrganizationId(UUID organizationId);
    
    List<Bonus> findByEmployeeIdAndOrganizationId(UUID employeeId, UUID organizationId);
    
    List<Bonus> findByOrganizationIdAndStatus(UUID organizationId, String status);
}


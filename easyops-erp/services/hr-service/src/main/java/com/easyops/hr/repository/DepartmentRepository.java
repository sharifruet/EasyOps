package com.easyops.hr.repository;

import com.easyops.hr.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    
    List<Department> findByOrganizationId(UUID organizationId);
    
    List<Department> findByOrganizationIdAndIsActive(UUID organizationId, Boolean isActive);
    
    List<Department> findByOrganizationIdAndParentDepartmentIdIsNull(UUID organizationId);
    
    List<Department> findByOrganizationIdAndParentDepartmentId(UUID organizationId, UUID parentDepartmentId);
    
    Optional<Department> findByOrganizationIdAndName(UUID organizationId, String name);
}


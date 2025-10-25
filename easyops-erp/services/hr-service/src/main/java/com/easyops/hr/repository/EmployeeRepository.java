package com.easyops.hr.repository;

import com.easyops.hr.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    
    List<Employee> findByOrganizationId(UUID organizationId);
    
    List<Employee> findByOrganizationIdAndEmploymentStatus(UUID organizationId, String employmentStatus);
    
    List<Employee> findByOrganizationIdAndDepartmentId(UUID organizationId, UUID departmentId);
    
    Optional<Employee> findByOrganizationIdAndEmployeeNumber(UUID organizationId, String employeeNumber);
    
    Optional<Employee> findByOrganizationIdAndEmail(UUID organizationId, String email);
    
    @Query("SELECT e FROM Employee e WHERE e.organizationId = :organizationId " +
           "AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Employee> searchEmployees(@Param("organizationId") UUID organizationId, 
                                  @Param("search") String search);
    
    long countByOrganizationIdAndEmploymentStatus(UUID organizationId, String employmentStatus);
}


package com.easyops.rbac.repository;

import com.easyops.rbac.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Role Repository
 * 
 * Repository interface for Role entity operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Role> findByIsActiveTrue();
    
    List<Role> findByIsSystemRoleTrue();
    
    @Query("SELECT r FROM Role r WHERE " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.code) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Role> searchRoles(@Param("searchTerm") String searchTerm);
}


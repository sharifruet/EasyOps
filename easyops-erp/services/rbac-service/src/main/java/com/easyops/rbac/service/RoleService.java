package com.easyops.rbac.service;

import com.easyops.rbac.dto.PermissionResponse;
import com.easyops.rbac.dto.RoleRequest;
import com.easyops.rbac.dto.RoleResponse;
import com.easyops.rbac.entity.Permission;
import com.easyops.rbac.entity.Role;
import com.easyops.rbac.repository.PermissionRepository;
import com.easyops.rbac.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Role Service
 * 
 * Service class for role management operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    /**
     * Create a new role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Role with code " + request.getCode() + " already exists");
        }

        Role role = new Role();
        role.setName(request.getName());
        role.setCode(request.getCode());
        role.setDescription(request.getDescription());
        role.setIsActive(request.getIsActive());
        role.setIsSystemRole(false);

        // Add permissions if provided
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        log.info("Created role: {}", savedRole.getCode());
        
        return mapToRoleResponse(savedRole);
    }

    /**
     * Get role by ID
     */
    @Cacheable(value = "roles", key = "#id")
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));
        return mapToRoleResponse(role);
    }

    /**
     * Get role by code
     */
    @Cacheable(value = "roles", key = "#code")
    @Transactional(readOnly = true)
    public RoleResponse getRoleByCode(String code) {
        Role role = roleRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Role not found with code: " + code));
        return mapToRoleResponse(role);
    }

    /**
     * Get all roles
     */
    @Transactional(readOnly = true)
    public Page<RoleResponse> getAllRoles(Pageable pageable) {
        return roleRepository.findAll(pageable)
                .map(this::mapToRoleResponse);
    }

    /**
     * Get all active roles
     */
    @Cacheable(value = "activeRoles")
    @Transactional(readOnly = true)
    public List<RoleResponse> getActiveRoles() {
        return roleRepository.findByIsActiveTrue().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get system roles
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> getSystemRoles() {
        return roleRepository.findByIsSystemRoleTrue().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public RoleResponse updateRole(UUID id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

        if (role.getIsSystemRole()) {
            throw new RuntimeException("Cannot modify system role");
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setIsActive(request.getIsActive());

        // Update permissions if provided
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                permissionRepository.findAllById(request.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        log.info("Updated role: {}", savedRole.getCode());
        
        return mapToRoleResponse(savedRole);
    }

    /**
     * Delete role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

        if (role.getIsSystemRole()) {
            throw new RuntimeException("Cannot delete system role");
        }

        roleRepository.delete(role);
        log.info("Deleted role: {}", role.getCode());
    }

    /**
     * Add permission to role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public RoleResponse addPermissionToRole(UUID roleId, UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        role.getPermissions().add(permission);
        Role savedRole = roleRepository.save(role);
        
        log.info("Added permission {} to role {}", permission.getCode(), role.getCode());
        return mapToRoleResponse(savedRole);
    }

    /**
     * Remove permission from role
     */
    @CacheEvict(value = "roles", allEntries = true)
    public RoleResponse removePermissionFromRole(UUID roleId, UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.getPermissions().removeIf(p -> p.getId().equals(permissionId));
        Role savedRole = roleRepository.save(role);
        
        log.info("Removed permission from role {}", role.getCode());
        return mapToRoleResponse(savedRole);
    }

    /**
     * Search roles
     */
    @Transactional(readOnly = true)
    public List<RoleResponse> searchRoles(String searchTerm) {
        return roleRepository.searchRoles(searchTerm).stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map Role entity to RoleResponse DTO
     */
    private RoleResponse mapToRoleResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setCode(role.getCode());
        response.setDescription(role.getDescription());
        response.setIsSystemRole(role.getIsSystemRole());
        response.setIsActive(role.getIsActive());
        response.setCreatedAt(role.getCreatedAt());
        response.setUpdatedAt(role.getUpdatedAt());
        
        if (role.getPermissions() != null) {
            Set<PermissionResponse> permissions = role.getPermissions().stream()
                    .map(this::mapToPermissionResponse)
                    .collect(Collectors.toSet());
            response.setPermissions(permissions);
        }
        
        return response;
    }

    /**
     * Map Permission entity to PermissionResponse DTO
     */
    private PermissionResponse mapToPermissionResponse(Permission permission) {
        PermissionResponse response = new PermissionResponse();
        response.setId(permission.getId());
        response.setName(permission.getName());
        response.setCode(permission.getCode());
        response.setResource(permission.getResource());
        response.setAction(permission.getAction());
        response.setDescription(permission.getDescription());
        response.setIsActive(permission.getIsActive());
        response.setCreatedAt(permission.getCreatedAt());
        response.setUpdatedAt(permission.getUpdatedAt());
        return response;
    }
}


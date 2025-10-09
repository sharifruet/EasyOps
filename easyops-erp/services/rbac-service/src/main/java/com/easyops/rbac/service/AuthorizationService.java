package com.easyops.rbac.service;

import com.easyops.rbac.dto.AuthorizationRequest;
import com.easyops.rbac.dto.PermissionResponse;
import com.easyops.rbac.dto.RoleResponse;
import com.easyops.rbac.dto.UserRoleRequest;
import com.easyops.rbac.entity.Role;
import com.easyops.rbac.entity.UserRole;
import com.easyops.rbac.repository.RoleRepository;
import com.easyops.rbac.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Authorization Service
 * 
 * Service class for authorization and user role management operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;

    /**
     * Assign roles to user
     */
    @CacheEvict(value = "userRoles", key = "#request.userId")
    public List<RoleResponse> assignRolesToUser(UserRoleRequest request) {
        // Delete existing roles for this user if organizationId is null (global roles)
        if (request.getOrganizationId() == null) {
            userRoleRepository.deleteByUserId(request.getUserId());
        }

        List<Role> roles = roleRepository.findAllById(request.getRoleIds());
        
        if (roles.size() != request.getRoleIds().size()) {
            throw new RuntimeException("Some role IDs are invalid");
        }

        List<UserRole> userRoles = new ArrayList<>();
        for (Role role : roles) {
            UserRole userRole = new UserRole();
            userRole.setUserId(request.getUserId());
            userRole.setRole(role);
            userRole.setOrganizationId(request.getOrganizationId());
            userRole.setExpiresAt(request.getExpiresAt());
            userRoles.add(userRole);
        }

        userRoleRepository.saveAll(userRoles);
        log.info("Assigned {} roles to user {}", userRoles.size(), request.getUserId());

        return getUserRoles(request.getUserId());
    }

    /**
     * Remove role from user
     */
    @CacheEvict(value = "userRoles", key = "#userId")
    public void removeRoleFromUser(UUID userId, UUID roleId) {
        userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);
        log.info("Removed role {} from user {}", roleId, userId);
    }

    /**
     * Remove all roles from user
     */
    @CacheEvict(value = "userRoles", key = "#userId")
    public void removeAllRolesFromUser(UUID userId) {
        userRoleRepository.deleteByUserId(userId);
        log.info("Removed all roles from user {}", userId);
    }

    /**
     * Get user roles
     */
    @Cacheable(value = "userRoles", key = "#userId")
    @Transactional(readOnly = true)
    public List<RoleResponse> getUserRoles(UUID userId) {
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(
                userId, LocalDateTime.now());
        
        return userRoles.stream()
                .map(ur -> roleService.getRoleById(ur.getRole().getId()))
                .collect(Collectors.toList());
    }

    /**
     * Get user permissions
     */
    @Cacheable(value = "userPermissions", key = "#userId")
    @Transactional(readOnly = true)
    public Set<PermissionResponse> getUserPermissions(UUID userId) {
        List<UserRole> userRoles = userRoleRepository.findActiveRolesByUserId(
                userId, LocalDateTime.now());
        
        Set<PermissionResponse> permissions = new HashSet<>();
        for (UserRole userRole : userRoles) {
            RoleResponse role = roleService.getRoleById(userRole.getRole().getId());
            if (role.getPermissions() != null) {
                permissions.addAll(role.getPermissions());
            }
        }
        
        return permissions;
    }

    /**
     * Check if user has permission
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(AuthorizationRequest request) {
        Set<PermissionResponse> permissions = getUserPermissions(request.getUserId());
        
        return permissions.stream()
                .anyMatch(p -> p.getResource().equals(request.getResource()) 
                        && p.getAction().equals(request.getAction())
                        && p.getIsActive());
    }

    /**
     * Check if user has role
     */
    @Transactional(readOnly = true)
    public boolean hasRole(UUID userId, String roleCode) {
        List<RoleResponse> roles = getUserRoles(userId);
        
        return roles.stream()
                .anyMatch(r -> r.getCode().equals(roleCode) && r.getIsActive());
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UUID> getUsersByRole(UUID roleId) {
        return userRoleRepository.findByRoleId(roleId).stream()
                .map(UserRole::getUserId)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Clean up expired roles
     */
    public void cleanupExpiredRoles() {
        userRoleRepository.deleteExpiredRoles(LocalDateTime.now());
        log.info("Cleaned up expired user roles");
    }
}


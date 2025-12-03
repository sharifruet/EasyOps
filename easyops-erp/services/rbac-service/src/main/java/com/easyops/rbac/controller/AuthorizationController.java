package com.easyops.rbac.controller;

import com.easyops.rbac.dto.*;
import com.easyops.rbac.service.AuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Authorization Controller
 * 
 * REST controller for authorization and user role management.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/rbac/authorization")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    @PostMapping("/users/roles")
    public ResponseEntity<List<RoleResponse>> assignRolesToUser(
            @Valid @RequestBody UserRoleRequest request) {
        List<RoleResponse> response = authorizationService.assignRolesToUser(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{userId}/roles/{roleId}")
    public ResponseEntity<Void> removeRoleFromUser(
            @PathVariable UUID userId,
            @PathVariable UUID roleId) {
        authorizationService.removeRoleFromUser(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}/roles")
    public ResponseEntity<Void> removeAllRolesFromUser(@PathVariable UUID userId) {
        authorizationService.removeAllRolesFromUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}/roles")
    public ResponseEntity<List<RoleResponse>> getUserRoles(@PathVariable UUID userId) {
        List<RoleResponse> response = authorizationService.getUserRoles(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/permissions")
    public ResponseEntity<List<PermissionResponse>> getUserPermissions(@PathVariable UUID userId) {
        List<PermissionResponse> response = authorizationService.getUserPermissions(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @Valid @RequestBody AuthorizationRequest request) {
        boolean hasPermission = authorizationService.hasPermission(request);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("authorized", hasPermission);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{userId}/has-role/{roleCode}")
    public ResponseEntity<Map<String, Boolean>> checkRole(
            @PathVariable UUID userId,
            @PathVariable String roleCode) {
        boolean hasRole = authorizationService.hasRole(userId, roleCode);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasRole", hasRole);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/roles/{roleId}/users")
    public ResponseEntity<List<UUID>> getUsersByRole(@PathVariable UUID roleId) {
        List<UUID> userIds = authorizationService.getUsersByRole(roleId);
        return ResponseEntity.ok(userIds);
    }
}


package com.easyops.rbac.controller;

import com.easyops.rbac.dto.RoleRequest;
import com.easyops.rbac.dto.RoleResponse;
import com.easyops.rbac.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Role Controller
 * 
 * REST controller for role management operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/rbac/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleRequest request) {
        RoleResponse response = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable UUID id) {
        RoleResponse response = roleService.getRoleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<RoleResponse> getRoleByCode(@PathVariable String code) {
        RoleResponse response = roleService.getRoleByCode(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<RoleResponse>> getAllRoles(Pageable pageable) {
        Page<RoleResponse> response = roleService.getAllRoles(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<RoleResponse>> getActiveRoles() {
        List<RoleResponse> response = roleService.getActiveRoles();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/system")
    public ResponseEntity<List<RoleResponse>> getSystemRoles() {
        List<RoleResponse> response = roleService.getSystemRoles();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable UUID id, 
            @Valid @RequestBody RoleRequest request) {
        RoleResponse response = roleService.updateRole(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<RoleResponse> addPermissionToRole(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId) {
        RoleResponse response = roleService.addPermissionToRole(roleId, permissionId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ResponseEntity<RoleResponse> removePermissionFromRole(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId) {
        RoleResponse response = roleService.removePermissionFromRole(roleId, permissionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<RoleResponse>> searchRoles(@RequestParam String query) {
        List<RoleResponse> response = roleService.searchRoles(query);
        return ResponseEntity.ok(response);
    }
}


package com.easyops.rbac.controller;

import com.easyops.rbac.dto.PermissionRequest;
import com.easyops.rbac.dto.PermissionResponse;
import com.easyops.rbac.service.PermissionService;
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
 * Permission Controller
 * 
 * REST controller for permission management operations.
 * 
 * @author EasyOps Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/rbac/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    public ResponseEntity<PermissionResponse> createPermission(
            @Valid @RequestBody PermissionRequest request) {
        PermissionResponse response = permissionService.createPermission(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionResponse> getPermissionById(@PathVariable UUID id) {
        PermissionResponse response = permissionService.getPermissionById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PermissionResponse> getPermissionByCode(@PathVariable String code) {
        PermissionResponse response = permissionService.getPermissionByCode(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<PermissionResponse>> getAllPermissions(Pageable pageable) {
        Page<PermissionResponse> response = permissionService.getAllPermissions(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PermissionResponse>> getActivePermissions() {
        List<PermissionResponse> response = permissionService.getActivePermissions();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resource/{resource}")
    public ResponseEntity<List<PermissionResponse>> getPermissionsByResource(
            @PathVariable String resource) {
        List<PermissionResponse> response = permissionService.getPermissionsByResource(resource);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PermissionResponse> updatePermission(
            @PathVariable UUID id,
            @Valid @RequestBody PermissionRequest request) {
        PermissionResponse response = permissionService.updatePermission(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable UUID id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<PermissionResponse>> searchPermissions(@RequestParam String query) {
        List<PermissionResponse> response = permissionService.searchPermissions(query);
        return ResponseEntity.ok(response);
    }
}


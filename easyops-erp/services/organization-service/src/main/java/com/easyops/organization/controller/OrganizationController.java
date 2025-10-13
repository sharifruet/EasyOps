package com.easyops.organization.controller;

import com.easyops.organization.dto.OrganizationRequest;
import com.easyops.organization.dto.OrganizationResponse;
import com.easyops.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Organization Controller
 * REST endpoints for organization management
 */
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@Slf4j
public class OrganizationController {

    private final OrganizationService organizationService;

    /**
     * Create new organization
     */
    @PostMapping
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody OrganizationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        UUID createdBy = userId != null ? UUID.fromString(userId) : null;
        OrganizationResponse response = organizationService.createOrganization(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get organization by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getOrganizationById(@PathVariable("id") UUID id) {
        OrganizationResponse response = organizationService.getOrganizationById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get organization by code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<OrganizationResponse> getOrganizationByCode(@PathVariable("code") String code) {
        OrganizationResponse response = organizationService.getOrganizationByCode(code);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all organizations (paginated)
     */
    @GetMapping
    public ResponseEntity<Page<OrganizationResponse>> getAllOrganizations(Pageable pageable) {
        Page<OrganizationResponse> response = organizationService.getAllOrganizations(pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get organizations by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrganizationResponse>> getOrganizationsByStatus(@PathVariable("status") String status) {
        List<OrganizationResponse> response = organizationService.getOrganizationsByStatus(status);
        return ResponseEntity.ok(response);
    }

    /**
     * Update organization
     */
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable("id") UUID id,
            @Valid @RequestBody OrganizationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        UUID updatedBy = userId != null ? UUID.fromString(userId) : null;
        OrganizationResponse response = organizationService.updateOrganization(id, request, updatedBy);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete organization
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable("id") UUID id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Activate organization
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<OrganizationResponse> activateOrganization(@PathVariable("id") UUID id) {
        OrganizationResponse response = organizationService.activateOrganization(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Suspend organization
     */
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<OrganizationResponse> suspendOrganization(@PathVariable("id") UUID id) {
        OrganizationResponse response = organizationService.suspendOrganization(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Update subscription plan
     */
    @PatchMapping("/{id}/subscription")
    public ResponseEntity<OrganizationResponse> updateSubscription(
            @PathVariable("id") UUID id,
            @RequestParam("plan") String plan,
            @RequestParam(value = "maxUsers", required = false) Integer maxUsers,
            @RequestParam(value = "maxStorage", required = false) Long maxStorage) {
        
        OrganizationResponse response = organizationService.updateSubscriptionPlan(id, plan, maxUsers, maxStorage);
        return ResponseEntity.ok(response);
    }
}


package com.easyops.ap.controller;

import com.easyops.ap.dto.VendorRequest;
import com.easyops.ap.entity.Vendor;
import com.easyops.ap.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ap/vendors")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AP Vendors", description = "Vendor management for Accounts Payable")
public class VendorController {
    private final VendorService vendorService;
    
    @GetMapping
    @Operation(summary = "Get all vendors for an organization")
    public ResponseEntity<List<Vendor>> getAllVendors(
            @RequestParam UUID organizationId,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<Vendor> vendors = activeOnly 
                ? vendorService.getActiveVendors(organizationId)
                : vendorService.getAllVendors(organizationId);
        return ResponseEntity.ok(vendors);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get vendor by ID")
    public ResponseEntity<Vendor> getVendorById(@PathVariable UUID id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new vendor")
    public ResponseEntity<Vendor> createVendor(@Valid @RequestBody VendorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendorService.createVendor(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update vendor")
    public ResponseEntity<Vendor> updateVendor(@PathVariable UUID id, @Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(vendorService.updateVendor(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete vendor")
    public ResponseEntity<Void> deleteVendor(@PathVariable UUID id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}


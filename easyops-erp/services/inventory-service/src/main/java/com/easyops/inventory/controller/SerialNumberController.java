package com.easyops.inventory.controller;

import com.easyops.inventory.entity.SerialNumber;
import com.easyops.inventory.service.SerialNumberService;
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
@RequestMapping("/api/inventory/serials")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Serial Number Tracking", description = "Serial number management APIs")
@CrossOrigin(origins = "*")
public class SerialNumberController {
    
    private final SerialNumberService serialNumberService;
    
    @GetMapping
    @Operation(summary = "Get all serial numbers")
    public ResponseEntity<List<SerialNumber>> getAllSerials(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String status) {
        log.info("GET /api/inventory/serials - org: {}, product: {}, status: {}", organizationId, productId, status);
        
        List<SerialNumber> serials;
        if (productId != null) {
            serials = serialNumberService.getSerialsByProduct(organizationId, productId);
        } else if (status != null) {
            serials = serialNumberService.getSerialsByStatus(organizationId, status);
        } else {
            serials = serialNumberService.getAllSerials(organizationId);
        }
        
        return ResponseEntity.ok(serials);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get serial number by ID")
    public ResponseEntity<SerialNumber> getSerialById(@PathVariable UUID id) {
        log.info("GET /api/inventory/serials/{}", id);
        SerialNumber serial = serialNumberService.getSerialById(id);
        return ResponseEntity.ok(serial);
    }
    
    @GetMapping("/available")
    @Operation(summary = "Get available serial numbers")
    public ResponseEntity<List<SerialNumber>> getAvailableSerials(
            @RequestParam UUID organizationId,
            @RequestParam UUID warehouseId) {
        log.info("GET /api/inventory/serials/available - org: {}, warehouse: {}", organizationId, warehouseId);
        List<SerialNumber> serials = serialNumberService.getAvailableSerials(organizationId, warehouseId);
        return ResponseEntity.ok(serials);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get serial numbers sold to customer")
    public ResponseEntity<List<SerialNumber>> getSerialsByCustomer(
            @RequestParam UUID organizationId,
            @PathVariable UUID customerId) {
        log.info("GET /api/inventory/serials/customer/{} - org: {}", customerId, organizationId);
        List<SerialNumber> serials = serialNumberService.getSerialsByCustomer(organizationId, customerId);
        return ResponseEntity.ok(serials);
    }
    
    @PostMapping
    @Operation(summary = "Register new serial number")
    public ResponseEntity<SerialNumber> registerSerial(@Valid @RequestBody SerialNumber serial) {
        log.info("POST /api/inventory/serials - serial: {}", serial.getSerialNumber());
        SerialNumber created = serialNumberService.registerSerial(serial);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/{id}/allocate")
    @Operation(summary = "Allocate serial number for sales order")
    public ResponseEntity<SerialNumber> allocateSerial(
            @PathVariable UUID id,
            @RequestParam UUID salesOrderId) {
        log.info("POST /api/inventory/serials/{}/allocate - order: {}", id, salesOrderId);
        SerialNumber serial = serialNumberService.allocateSerial(id, salesOrderId);
        return ResponseEntity.ok(serial);
    }
    
    @PostMapping("/{id}/sell")
    @Operation(summary = "Mark serial number as sold")
    public ResponseEntity<SerialNumber> sellSerial(
            @PathVariable UUID id,
            @RequestParam UUID customerId,
            @RequestParam String invoiceNumber) {
        log.info("POST /api/inventory/serials/{}/sell - customer: {}", id, customerId);
        SerialNumber serial = serialNumberService.sellSerial(id, customerId, invoiceNumber);
        return ResponseEntity.ok(serial);
    }
    
    @PostMapping("/{id}/return")
    @Operation(summary = "Process serial number return")
    public ResponseEntity<SerialNumber> returnSerial(@PathVariable UUID id) {
        log.info("POST /api/inventory/serials/{}/return", id);
        SerialNumber serial = serialNumberService.returnSerial(id);
        return ResponseEntity.ok(serial);
    }
}


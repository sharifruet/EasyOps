package com.easyops.inventory.controller;

import com.easyops.inventory.entity.Warehouse;
import com.easyops.inventory.service.WarehouseService;
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
@RequestMapping("/api/inventory/warehouses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Warehouse Management", description = "Warehouse management APIs")
@CrossOrigin(origins = "*")
public class WarehouseController {
    
    private final WarehouseService warehouseService;
    
    @GetMapping
    @Operation(summary = "Get all warehouses")
    public ResponseEntity<List<Warehouse>> getAllWarehouses(@RequestParam UUID organizationId,
                                                            @RequestParam(required = false) Boolean activeOnly) {
        log.info("GET /api/inventory/warehouses - organizationId: {}, activeOnly: {}", organizationId, activeOnly);
        List<Warehouse> warehouses = Boolean.TRUE.equals(activeOnly)
                ? warehouseService.getActiveWarehouses(organizationId)
                : warehouseService.getAllWarehouses(organizationId);
        return ResponseEntity.ok(warehouses);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable UUID id) {
        log.info("GET /api/inventory/warehouses/{}", id);
        Warehouse warehouse = warehouseService.getWarehouseById(id);
        return ResponseEntity.ok(warehouse);
    }
    
    @PostMapping
    @Operation(summary = "Create new warehouse")
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody Warehouse warehouse) {
        log.info("POST /api/inventory/warehouses - code: {}", warehouse.getCode());
        Warehouse createdWarehouse = warehouseService.createWarehouse(warehouse);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWarehouse);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update warehouse")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable UUID id, @Valid @RequestBody Warehouse warehouse) {
        log.info("PUT /api/inventory/warehouses/{}", id);
        Warehouse updatedWarehouse = warehouseService.updateWarehouse(id, warehouse);
        return ResponseEntity.ok(updatedWarehouse);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete warehouse")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable UUID id) {
        log.info("DELETE /api/inventory/warehouses/{}", id);
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }
}


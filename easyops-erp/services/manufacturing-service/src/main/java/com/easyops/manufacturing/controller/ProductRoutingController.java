package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.entity.ProductRouting;
import com.easyops.manufacturing.service.ProductRoutingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/routings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductRoutingController {

    private final ProductRoutingService routingService;

    @GetMapping
    public ResponseEntity<List<ProductRouting>> getAllRoutings(@RequestParam UUID organizationId) {
        List<ProductRouting> routings = routingService.getAllRoutingsByOrganization(organizationId);
        return ResponseEntity.ok(routings);
    }

    @GetMapping("/{routingId}")
    public ResponseEntity<ProductRouting> getRoutingById(@PathVariable UUID routingId) {
        return routingService.getRoutingById(routingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{routingNumber}")
    public ResponseEntity<ProductRouting> getRoutingByNumber(
            @PathVariable String routingNumber,
            @RequestParam UUID organizationId) {
        return routingService.getRoutingByNumber(organizationId, routingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductRouting>> getRoutingsByProduct(@PathVariable UUID productId) {
        List<ProductRouting> routings = routingService.getRoutingsByProduct(productId);
        return ResponseEntity.ok(routings);
    }

    @GetMapping("/product/{productId}/active")
    public ResponseEntity<List<ProductRouting>> getActiveRoutingsByProduct(@PathVariable UUID productId) {
        List<ProductRouting> routings = routingService.getActiveRoutingsByProduct(productId);
        return ResponseEntity.ok(routings);
    }

    @GetMapping("/bom/{bomId}/active")
    public ResponseEntity<List<ProductRouting>> getActiveRoutingsByBom(@PathVariable UUID bomId) {
        List<ProductRouting> routings = routingService.getActiveRoutingsByBom(bomId);
        return ResponseEntity.ok(routings);
    }

    @GetMapping("/work-center/{workCenterCode}")
    public ResponseEntity<List<ProductRouting>> getRoutingsByWorkCenter(@PathVariable String workCenterCode) {
        List<ProductRouting> routings = routingService.getRoutingsByWorkCenter(workCenterCode);
        return ResponseEntity.ok(routings);
    }

    @PostMapping
    public ResponseEntity<ProductRouting> createRouting(@RequestBody ProductRouting routing) {
        ProductRouting created = routingService.createRouting(routing);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{routingId}")
    public ResponseEntity<ProductRouting> updateRouting(
            @PathVariable UUID routingId,
            @RequestBody ProductRouting routing) {
        ProductRouting updated = routingService.updateRouting(routingId, routing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{routingId}")
    public ResponseEntity<Void> deleteRouting(@PathVariable UUID routingId) {
        routingService.deleteRouting(routingId);
        return ResponseEntity.noContent().build();
    }

    // Production Time Calculation
    @GetMapping("/product/{productId}/production-time")
    public ResponseEntity<Map<String, Object>> calculateProductionTime(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "1") BigDecimal quantity) {
        Map<String, Object> result = routingService.calculateProductionTime(productId, quantity);
        return ResponseEntity.ok(result);
    }
}


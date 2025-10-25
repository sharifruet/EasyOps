package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.entity.BomHeader;
import com.easyops.manufacturing.entity.BomLine;
import com.easyops.manufacturing.entity.BomVersion;
import com.easyops.manufacturing.service.BomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/boms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BomController {

    private final BomService bomService;

    // ==================== BOM Header Endpoints ====================

    @GetMapping
    public ResponseEntity<List<BomHeader>> getAllBoms(@RequestParam UUID organizationId) {
        List<BomHeader> boms = bomService.getAllBomsByOrganization(organizationId);
        return ResponseEntity.ok(boms);
    }

    @GetMapping("/{bomId}")
    public ResponseEntity<BomHeader> getBomById(@PathVariable UUID bomId) {
        return bomService.getBomById(bomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{bomNumber}")
    public ResponseEntity<BomHeader> getBomByNumber(
            @PathVariable String bomNumber,
            @RequestParam UUID organizationId) {
        return bomService.getBomByNumber(organizationId, bomNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BomHeader>> getBomsByProduct(
            @PathVariable UUID productId,
            @RequestParam UUID organizationId) {
        List<BomHeader> boms = bomService.getBomsByProduct(organizationId, productId);
        return ResponseEntity.ok(boms);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BomHeader>> getActiveBoms(@RequestParam UUID organizationId) {
        List<BomHeader> boms = bomService.getActiveBoms(organizationId);
        return ResponseEntity.ok(boms);
    }

    @GetMapping("/product/{productId}/latest")
    public ResponseEntity<BomHeader> getLatestBomForProduct(@PathVariable UUID productId) {
        return bomService.getLatestActiveBomForProduct(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<BomHeader> createBom(@RequestBody BomHeader bomHeader) {
        BomHeader created = bomService.createBom(bomHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{bomId}")
    public ResponseEntity<BomHeader> updateBom(
            @PathVariable UUID bomId,
            @RequestBody BomHeader bomHeader) {
        BomHeader updated = bomService.updateBom(bomId, bomHeader);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{bomId}")
    public ResponseEntity<Void> deleteBom(@PathVariable UUID bomId) {
        bomService.deleteBom(bomId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{bomId}/approve")
    public ResponseEntity<BomHeader> approveBom(
            @PathVariable UUID bomId,
            @RequestParam UUID approvedBy) {
        BomHeader approved = bomService.approveBom(bomId, approvedBy);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{bomId}/recalculate-costs")
    public ResponseEntity<BomHeader> recalculateCosts(@PathVariable UUID bomId) {
        BomHeader bom = bomService.recalculateBomCosts(bomId);
        return ResponseEntity.ok(bom);
    }

    // ==================== BOM Line Endpoints ====================

    @GetMapping("/{bomId}/lines")
    public ResponseEntity<List<BomLine>> getBomLines(@PathVariable UUID bomId) {
        List<BomLine> lines = bomService.getBomLines(bomId);
        return ResponseEntity.ok(lines);
    }

    @GetMapping("/{bomId}/lines/top-level")
    public ResponseEntity<List<BomLine>> getTopLevelComponents(@PathVariable UUID bomId) {
        List<BomLine> lines = bomService.getTopLevelComponents(bomId);
        return ResponseEntity.ok(lines);
    }

    @PostMapping("/{bomId}/lines")
    public ResponseEntity<BomLine> addBomLine(@RequestBody BomLine bomLine) {
        BomLine created = bomService.addBomLine(bomLine);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/lines/{bomLineId}")
    public ResponseEntity<BomLine> updateBomLine(
            @PathVariable UUID bomLineId,
            @RequestBody BomLine bomLine) {
        BomLine updated = bomService.updateBomLine(bomLineId, bomLine);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/lines/{bomLineId}")
    public ResponseEntity<Void> deleteBomLine(@PathVariable UUID bomLineId) {
        bomService.deleteBomLine(bomLineId);
        return ResponseEntity.noContent().build();
    }

    // ==================== BOM Explosion ====================

    @GetMapping("/{bomId}/explosion")
    public ResponseEntity<Map<String, Object>> explodeBom(
            @PathVariable UUID bomId,
            @RequestParam(defaultValue = "1") BigDecimal quantity) {
        Map<String, Object> explosion = bomService.explodeBom(bomId, quantity);
        return ResponseEntity.ok(explosion);
    }

    // ==================== BOM Version Endpoints ====================

    @GetMapping("/{bomId}/versions")
    public ResponseEntity<List<BomVersion>> getBomVersions(@PathVariable UUID bomId) {
        List<BomVersion> versions = bomService.getBomVersions(bomId);
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{bomId}/versions")
    public ResponseEntity<BomVersion> createBomVersion(@RequestBody BomVersion bomVersion) {
        BomVersion created = bomService.createBomVersion(bomVersion);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ==================== Dashboard & Stats ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = bomService.getBomDashboardStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}


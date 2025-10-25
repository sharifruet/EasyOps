package com.easyops.hr.controller;

import com.easyops.hr.entity.Position;
import com.easyops.hr.service.PositionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/positions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PositionController {
    
    private final PositionService positionService;
    
    @GetMapping
    public ResponseEntity<List<Position>> getAllPositions(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) UUID departmentId) {
        
        log.info("GET /positions - organizationId: {}, activeOnly: {}, departmentId: {}", 
                organizationId, activeOnly, departmentId);
        
        List<Position> positions;
        
        if (departmentId != null) {
            positions = positionService.getPositionsByDepartment(organizationId, departmentId);
        } else if (Boolean.TRUE.equals(activeOnly)) {
            positions = positionService.getActivePositions(organizationId);
        } else {
            positions = positionService.getAllPositions(organizationId);
        }
        
        return ResponseEntity.ok(positions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Position> getPositionById(@PathVariable UUID id) {
        log.info("GET /positions/{}", id);
        Position position = positionService.getPositionById(id);
        return ResponseEntity.ok(position);
    }
    
    @PostMapping
    public ResponseEntity<Position> createPosition(@RequestBody Position position) {
        log.info("POST /positions - Creating position: {}", position.getTitle());
        Position createdPosition = positionService.createPosition(position);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPosition);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Position> updatePosition(
            @PathVariable UUID id,
            @RequestBody Position position) {
        log.info("PUT /positions/{}", id);
        Position updatedPosition = positionService.updatePosition(id, position);
        return ResponseEntity.ok(updatedPosition);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosition(@PathVariable UUID id) {
        log.info("DELETE /positions/{}", id);
        positionService.deletePosition(id);
        return ResponseEntity.noContent().build();
    }
}


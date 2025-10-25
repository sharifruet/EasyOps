package com.easyops.crm.controller;

import com.easyops.crm.entity.OpportunityStage;
import com.easyops.crm.service.PipelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/pipeline")
@CrossOrigin(origins = "*")
public class PipelineController {
    
    @Autowired
    private PipelineService pipelineService;
    
    @GetMapping("/stages")
    public ResponseEntity<List<OpportunityStage>> getAllStages(
            @RequestParam UUID organizationId,
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        
        List<OpportunityStage> stages;
        if (activeOnly) {
            stages = pipelineService.getActiveStages(organizationId);
        } else {
            stages = pipelineService.getAllStages(organizationId);
        }
        return ResponseEntity.ok(stages);
    }
    
    @GetMapping("/stages/{id}")
    public ResponseEntity<OpportunityStage> getStageById(@PathVariable UUID id) {
        return pipelineService.getStageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/stages/code/{code}")
    public ResponseEntity<OpportunityStage> getStageByCode(
            @RequestParam UUID organizationId,
            @PathVariable String code) {
        return pipelineService.getStageByCode(organizationId, code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/stages")
    public ResponseEntity<OpportunityStage> createStage(@RequestBody OpportunityStage stage) {
        OpportunityStage created = pipelineService.createStage(stage);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/stages/{id}")
    public ResponseEntity<OpportunityStage> updateStage(
            @PathVariable UUID id,
            @RequestBody OpportunityStage stage) {
        try {
            OpportunityStage updated = pipelineService.updateStage(id, stage);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/stages/{id}")
    public ResponseEntity<Void> deleteStage(@PathVariable UUID id) {
        pipelineService.deleteStage(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPipelineStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = pipelineService.getPipelineStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}


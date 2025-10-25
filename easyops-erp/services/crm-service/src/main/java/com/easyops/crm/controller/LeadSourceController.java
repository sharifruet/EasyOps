package com.easyops.crm.controller;

import com.easyops.crm.entity.LeadSource;
import com.easyops.crm.repository.LeadSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lead-sources")
@CrossOrigin(origins = "*")
public class LeadSourceController {
    
    @Autowired
    private LeadSourceRepository leadSourceRepository;
    
    @GetMapping
    public ResponseEntity<List<LeadSource>> getAllLeadSources(@RequestParam UUID organizationId) {
        List<LeadSource> sources = leadSourceRepository.findByOrganizationId(organizationId);
        return ResponseEntity.ok(sources);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeadSource> getLeadSourceById(@PathVariable UUID id) {
        return leadSourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<LeadSource> createLeadSource(@RequestBody LeadSource leadSource) {
        LeadSource created = leadSourceRepository.save(leadSource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<LeadSource> updateLeadSource(
            @PathVariable UUID id,
            @RequestBody LeadSource leadSourceDetails) {
        return leadSourceRepository.findById(id)
                .map(source -> {
                    source.setSourceName(leadSourceDetails.getSourceName());
                    source.setSourceCode(leadSourceDetails.getSourceCode());
                    source.setSourceType(leadSourceDetails.getSourceType());
                    source.setIsActive(leadSourceDetails.getIsActive());
                    source.setDescription(leadSourceDetails.getDescription());
                    source.setUpdatedBy(leadSourceDetails.getUpdatedBy());
                    LeadSource updated = leadSourceRepository.save(source);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeadSource(@PathVariable UUID id) {
        leadSourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}


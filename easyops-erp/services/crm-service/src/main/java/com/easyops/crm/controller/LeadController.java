package com.easyops.crm.controller;

import com.easyops.crm.entity.Lead;
import com.easyops.crm.entity.LeadActivity;
import com.easyops.crm.repository.LeadActivityRepository;
import com.easyops.crm.service.LeadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/crm/leads")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LeadController {
    
    private final LeadService leadService;
    private final LeadActivityRepository leadActivityRepository;
    
    @GetMapping
    public ResponseEntity<List<Lead>> getAllLeads(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) String search) {
        
        log.info("GET /api/crm/leads - organizationId: {}, status: {}", organizationId, status);
        
        List<Lead> leads;
        
        if (search != null && !search.isEmpty()) {
            leads = leadService.searchLeads(organizationId, search);
        } else if (status != null) {
            leads = leadService.getLeadsByStatus(organizationId, status);
        } else if (ownerId != null) {
            leads = leadService.getLeadsByOwner(organizationId, ownerId);
        } else {
            leads = leadService.getAllLeads(organizationId);
        }
        
        return ResponseEntity.ok(leads);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable UUID id) {
        log.info("GET /api/crm/leads/{}", id);
        Lead lead = leadService.getLeadById(id);
        return ResponseEntity.ok(lead);
    }
    
    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody Lead lead) {
        log.info("POST /api/crm/leads - Creating lead");
        Lead created = leadService.createLead(lead);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable UUID id, @RequestBody Lead lead) {
        log.info("PUT /api/crm/leads/{}", id);
        Lead updated = leadService.updateLead(id, lead);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        log.info("DELETE /api/crm/leads/{}", id);
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/assign")
    public ResponseEntity<Lead> assignLead(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID ownerId = UUID.fromString(request.get("ownerId"));
        log.info("POST /api/crm/leads/{}/assign - ownerId: {}", id, ownerId);
        Lead assigned = leadService.assignLead(id, ownerId);
        return ResponseEntity.ok(assigned);
    }
    
    @PostMapping("/{id}/qualify")
    public ResponseEntity<Lead> qualifyLead(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID qualifiedBy = UUID.fromString(request.get("qualifiedBy"));
        log.info("POST /api/crm/leads/{}/qualify", id);
        Lead qualified = leadService.qualifyLead(id, qualifiedBy);
        return ResponseEntity.ok(qualified);
    }
    
    @PostMapping("/{id}/disqualify")
    public ResponseEntity<Lead> disqualifyLead(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        String reason = request.get("reason");
        log.info("POST /api/crm/leads/{}/disqualify", id);
        Lead disqualified = leadService.disqualifyLead(id, reason);
        return ResponseEntity.ok(disqualified);
    }
    
    @PostMapping("/{id}/convert")
    public ResponseEntity<Map<String, Object>> convertLead(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID convertedBy = UUID.fromString(request.get("convertedBy"));
        UUID accountId = request.containsKey("accountId") ? UUID.fromString(request.get("accountId")) : null;
        UUID contactId = request.containsKey("contactId") ? UUID.fromString(request.get("contactId")) : null;
        UUID opportunityId = request.containsKey("opportunityId") ? UUID.fromString(request.get("opportunityId")) : null;
        
        log.info("POST /api/crm/leads/{}/convert", id);
        Map<String, Object> result = leadService.convertLead(id, convertedBy, accountId, contactId, opportunityId);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/{id}/activities")
    public ResponseEntity<List<LeadActivity>> getLeadActivities(@PathVariable UUID id) {
        log.info("GET /api/crm/leads/{}/activities", id);
        List<LeadActivity> activities = leadActivityRepository.findByLeadIdOrderByActivityDateDesc(id);
        return ResponseEntity.ok(activities);
    }
    
    @PostMapping("/{id}/activities")
    public ResponseEntity<LeadActivity> createLeadActivity(
            @PathVariable UUID id,
            @RequestBody LeadActivity activity) {
        
        log.info("POST /api/crm/leads/{}/activities", id);
        activity.setLeadId(id);
        LeadActivity created = leadActivityRepository.save(activity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam UUID organizationId) {
        log.info("GET /api/crm/leads/dashboard/stats - organizationId: {}", organizationId);
        Map<String, Object> stats = leadService.getDashboardStats(organizationId);
        return ResponseEntity.ok(stats);
    }
}



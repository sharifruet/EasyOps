package com.easyops.crm.controller;

import com.easyops.crm.entity.Case;
import com.easyops.crm.entity.CaseComment;
import com.easyops.crm.service.CaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/cases")
@CrossOrigin(origins = "*")
public class CaseController {
    
    @Autowired
    private CaseService caseService;
    
    @GetMapping
    public ResponseEntity<List<Case>> getAllCases(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(required = false) String search) {
        
        List<Case> cases;
        
        if (search != null && !search.isEmpty()) {
            cases = caseService.searchCases(organizationId, search);
        } else if (status != null) {
            cases = caseService.getCasesByStatus(organizationId, status);
        } else if (priority != null) {
            cases = caseService.getCasesByPriority(organizationId, priority);
        } else if (assignedTo != null) {
            cases = caseService.getCasesByAssignedUser(organizationId, assignedTo);
        } else {
            cases = caseService.getAllCases(organizationId);
        }
        
        return ResponseEntity.ok(cases);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Case> getCaseById(@PathVariable UUID id) {
        return caseService.getCaseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{number}")
    public ResponseEntity<Case> getCaseByCaseNumber(
            @RequestParam UUID organizationId,
            @PathVariable String number) {
        return caseService.getCaseByCaseNumber(organizationId, number)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Case> createCase(@RequestBody Case caseEntity) {
        Case created = caseService.createCase(caseEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Case> updateCase(
            @PathVariable UUID id,
            @RequestBody Case caseEntity) {
        try {
            Case updated = caseService.updateCase(id, caseEntity);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable UUID id) {
        caseService.deleteCase(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/sla-breached")
    public ResponseEntity<List<Case>> getSlaBreachedCases(@RequestParam UUID organizationId) {
        List<Case> cases = caseService.getSlaBreachedCases(organizationId);
        return ResponseEntity.ok(cases);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<Case>> getOverdueCases(@RequestParam UUID organizationId) {
        List<Case> cases = caseService.getOverdueCases(organizationId);
        return ResponseEntity.ok(cases);
    }
    
    @PostMapping("/{id}/assign")
    public ResponseEntity<Case> assignCase(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> request) {
        try {
            UUID assignedTo = request.get("assignedTo");
            Case updated = caseService.assignCase(id, assignedTo);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/resolve")
    public ResponseEntity<Case> resolveCase(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            UUID resolvedBy = UUID.fromString(request.get("resolvedBy").toString());
            String resolution = request.get("resolution").toString();
            Case updated = caseService.resolveCase(id, resolvedBy, resolution);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/close")
    public ResponseEntity<Case> closeCase(@PathVariable UUID id) {
        try {
            Case updated = caseService.closeCase(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/rate")
    public ResponseEntity<Case> rateCase(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            Integer rating = Integer.parseInt(request.get("rating").toString());
            String feedback = request.get("feedback") != null ? request.get("feedback").toString() : null;
            Case updated = caseService.rateCase(id, rating, feedback);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCaseStats(@RequestParam UUID organizationId) {
        Map<String, Object> stats = caseService.getCaseStats(organizationId);
        return ResponseEntity.ok(stats);
    }
    
    // Case Comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CaseComment>> getCaseComments(@PathVariable UUID id) {
        List<CaseComment> comments = caseService.getCaseComments(id);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping("/{id}/comments")
    public ResponseEntity<CaseComment> addComment(
            @PathVariable UUID id,
            @RequestBody CaseComment comment) {
        comment.setCaseId(id);
        CaseComment created = caseService.addComment(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        caseService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}


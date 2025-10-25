package com.easyops.crm.controller;

import com.easyops.crm.entity.Opportunity;
import com.easyops.crm.entity.OpportunityActivity;
import com.easyops.crm.entity.OpportunityProduct;
import com.easyops.crm.service.OpportunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/opportunities")
@CrossOrigin(origins = "*")
public class OpportunityController {
    
    @Autowired
    private OpportunityService opportunityService;
    
    @GetMapping
    public ResponseEntity<List<Opportunity>> getAllOpportunities(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID stageId,
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) String search) {
        
        List<Opportunity> opportunities;
        
        if (search != null && !search.isEmpty()) {
            opportunities = opportunityService.searchOpportunities(organizationId, search);
        } else if (status != null) {
            opportunities = opportunityService.getOpportunitiesByStatus(organizationId, status);
        } else if (stageId != null) {
            opportunities = opportunityService.getOpportunitiesByStage(organizationId, stageId);
        } else if (ownerId != null) {
            opportunities = opportunityService.getOpportunitiesByOwner(organizationId, ownerId);
        } else if (accountId != null) {
            opportunities = opportunityService.getOpportunitiesByAccount(organizationId, accountId);
        } else {
            opportunities = opportunityService.getAllOpportunities(organizationId);
        }
        
        return ResponseEntity.ok(opportunities);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Opportunity> getOpportunityById(@PathVariable UUID id) {
        return opportunityService.getOpportunityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{number}")
    public ResponseEntity<Opportunity> getOpportunityByNumber(
            @RequestParam UUID organizationId,
            @PathVariable String number) {
        return opportunityService.getOpportunityByNumber(organizationId, number)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Opportunity> createOpportunity(@RequestBody Opportunity opportunity) {
        Opportunity created = opportunityService.createOpportunity(opportunity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Opportunity> updateOpportunity(
            @PathVariable UUID id,
            @RequestBody Opportunity opportunity) {
        try {
            Opportunity updated = opportunityService.updateOpportunity(id, opportunity);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(@PathVariable UUID id) {
        opportunityService.deleteOpportunity(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/closing-soon")
    public ResponseEntity<List<Opportunity>> getClosingSoon(
            @RequestParam UUID organizationId,
            @RequestParam(defaultValue = "30") int days) {
        List<Opportunity> opportunities = opportunityService.getClosingSoon(organizationId, days);
        return ResponseEntity.ok(opportunities);
    }
    
    @PostMapping("/{id}/move-stage")
    public ResponseEntity<Opportunity> moveToStage(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> request) {
        try {
            UUID stageId = request.get("stageId");
            Opportunity updated = opportunityService.moveToStage(id, stageId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/won")
    public ResponseEntity<Opportunity> markAsWon(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String winDescription = request != null ? request.get("winDescription") : null;
            Opportunity updated = opportunityService.markAsWon(id, winDescription);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/lost")
    public ResponseEntity<Opportunity> markAsLost(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        try {
            String lossReason = request.get("lossReason");
            String lossDescription = request.get("lossDescription");
            Opportunity updated = opportunityService.markAsLost(id, lossReason, lossDescription);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Opportunity Products
    @GetMapping("/{id}/products")
    public ResponseEntity<List<OpportunityProduct>> getOpportunityProducts(@PathVariable UUID id) {
        List<OpportunityProduct> products = opportunityService.getOpportunityProducts(id);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/{id}/products")
    public ResponseEntity<OpportunityProduct> addProduct(
            @PathVariable UUID id,
            @RequestBody OpportunityProduct product) {
        product.setOpportunityId(id);
        OpportunityProduct created = opportunityService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/products/{productId}")
    public ResponseEntity<OpportunityProduct> updateProduct(
            @PathVariable UUID productId,
            @RequestBody OpportunityProduct product) {
        try {
            OpportunityProduct updated = opportunityService.updateProduct(productId, product);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID productId) {
        opportunityService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
    
    // Opportunity Activities
    @GetMapping("/{id}/activities")
    public ResponseEntity<List<OpportunityActivity>> getOpportunityActivities(@PathVariable UUID id) {
        List<OpportunityActivity> activities = opportunityService.getOpportunityActivities(id);
        return ResponseEntity.ok(activities);
    }
    
    @PostMapping("/{id}/activities")
    public ResponseEntity<OpportunityActivity> addActivity(
            @PathVariable UUID id,
            @RequestBody OpportunityActivity activity) {
        activity.setOpportunityId(id);
        OpportunityActivity created = opportunityService.addActivity(activity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/activities/{activityId}")
    public ResponseEntity<OpportunityActivity> updateActivity(
            @PathVariable UUID activityId,
            @RequestBody OpportunityActivity activity) {
        try {
            OpportunityActivity updated = opportunityService.updateActivity(activityId, activity);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable UUID activityId) {
        opportunityService.deleteActivity(activityId);
        return ResponseEntity.noContent().build();
    }
}


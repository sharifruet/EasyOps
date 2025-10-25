package com.easyops.crm.controller;

import com.easyops.crm.entity.Campaign;
import com.easyops.crm.entity.CampaignMember;
import com.easyops.crm.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {
    
    @Autowired
    private CampaignService campaignService;
    
    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search) {
        
        List<Campaign> campaigns;
        
        if (search != null && !search.isEmpty()) {
            campaigns = campaignService.searchCampaigns(organizationId, search);
        } else if (status != null) {
            campaigns = campaignService.getCampaignsByStatus(organizationId, status);
        } else if (type != null) {
            campaigns = campaignService.getCampaignsByType(organizationId, type);
        } else {
            campaigns = campaignService.getAllCampaigns(organizationId);
        }
        
        return ResponseEntity.ok(campaigns);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(@PathVariable UUID id) {
        return campaignService.getCampaignById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{number}")
    public ResponseEntity<Campaign> getCampaignByNumber(
            @RequestParam UUID organizationId,
            @PathVariable String number) {
        return campaignService.getCampaignByNumber(organizationId, number)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        Campaign created = campaignService.createCampaign(campaign);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(
            @PathVariable UUID id,
            @RequestBody Campaign campaign) {
        try {
            Campaign updated = campaignService.updateCampaign(id, campaign);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Campaign>> getActiveCampaigns(@RequestParam UUID organizationId) {
        List<Campaign> campaigns = campaignService.getActiveCampaigns(organizationId);
        return ResponseEntity.ok(campaigns);
    }
    
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getCampaignStats(@PathVariable UUID id) {
        Map<String, Object> stats = campaignService.getCampaignStats(id);
        return ResponseEntity.ok(stats);
    }
    
    // Campaign Members
    @GetMapping("/{id}/members")
    public ResponseEntity<List<CampaignMember>> getCampaignMembers(@PathVariable UUID id) {
        List<CampaignMember> members = campaignService.getCampaignMembers(id);
        return ResponseEntity.ok(members);
    }
    
    @PostMapping("/{id}/members")
    public ResponseEntity<CampaignMember> addCampaignMember(
            @PathVariable UUID id,
            @RequestBody CampaignMember member) {
        member.setCampaignId(id);
        CampaignMember created = campaignService.addCampaignMember(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/members/{memberId}")
    public ResponseEntity<CampaignMember> updateCampaignMember(
            @PathVariable UUID memberId,
            @RequestBody CampaignMember member) {
        try {
            CampaignMember updated = campaignService.updateCampaignMember(memberId, member);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> deleteCampaignMember(@PathVariable UUID memberId) {
        campaignService.deleteCampaignMember(memberId);
        return ResponseEntity.noContent().build();
    }
}


package com.easyops.crm.controller;

import com.easyops.crm.entity.EmailTemplate;
import com.easyops.crm.service.EmailTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/email-templates")
@CrossOrigin(origins = "*")
public class EmailTemplateController {
    
    @Autowired
    private EmailTemplateService templateService;
    
    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) String templateType) {
        
        List<EmailTemplate> templates;
        
        if (activeOnly != null && activeOnly) {
            templates = templateService.getActiveTemplates(organizationId);
        } else if (templateType != null) {
            templates = templateService.getTemplatesByType(organizationId, templateType);
        } else {
            templates = templateService.getAllTemplates(organizationId);
        }
        
        return ResponseEntity.ok(templates);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplate> getTemplateById(@PathVariable UUID id) {
        return templateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<EmailTemplate> getTemplateByCode(
            @RequestParam UUID organizationId,
            @PathVariable String code) {
        return templateService.getTemplateByCode(organizationId, code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<EmailTemplate> createTemplate(@RequestBody EmailTemplate template) {
        EmailTemplate created = templateService.createTemplate(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> updateTemplate(
            @PathVariable UUID id,
            @RequestBody EmailTemplate template) {
        try {
            EmailTemplate updated = templateService.updateTemplate(id, template);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}


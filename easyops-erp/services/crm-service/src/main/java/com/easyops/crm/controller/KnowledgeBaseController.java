package com.easyops.crm.controller;

import com.easyops.crm.entity.KnowledgeBase;
import com.easyops.crm.service.KnowledgeBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/knowledge-base")
@CrossOrigin(origins = "*")
public class KnowledgeBaseController {
    
    @Autowired
    private KnowledgeBaseService kbService;
    
    @GetMapping
    public ResponseEntity<List<KnowledgeBase>> getAllArticles(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean publicOnly,
            @RequestParam(required = false) Boolean featuredOnly,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        List<KnowledgeBase> articles;
        
        if (search != null && !search.isEmpty()) {
            articles = kbService.searchArticles(organizationId, search);
        } else if (publicOnly != null && publicOnly) {
            articles = kbService.getPublicArticles(organizationId);
        } else if (featuredOnly != null && featuredOnly) {
            articles = kbService.getFeaturedArticles(organizationId);
        } else if (category != null) {
            articles = kbService.getArticlesByCategory(organizationId, category);
        } else {
            articles = kbService.getAllArticles(organizationId);
        }
        
        return ResponseEntity.ok(articles);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeBase> getArticleById(@PathVariable UUID id) {
        kbService.incrementViewCount(id);
        return kbService.getArticleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/slug/{slug}")
    public ResponseEntity<KnowledgeBase> getArticleBySlug(
            @RequestParam UUID organizationId,
            @PathVariable String slug) {
        Optional<KnowledgeBase> article = kbService.getArticleBySlug(organizationId, slug);
        article.ifPresent(kb -> kbService.incrementViewCount(kb.getArticleId()));
        return article.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<KnowledgeBase> createArticle(@RequestBody KnowledgeBase article) {
        KnowledgeBase created = kbService.createArticle(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeBase> updateArticle(
            @PathVariable UUID id,
            @RequestBody KnowledgeBase article) {
        try {
            KnowledgeBase updated = kbService.updateArticle(id, article);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable UUID id) {
        kbService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/publish")
    public ResponseEntity<KnowledgeBase> publishArticle(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> request) {
        try {
            UUID publishedBy = request.get("publishedBy");
            KnowledgeBase updated = kbService.publishArticle(id, publishedBy);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/helpful")
    public ResponseEntity<Void> markHelpful(@PathVariable UUID id) {
        kbService.markHelpful(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/not-helpful")
    public ResponseEntity<Void> markNotHelpful(@PathVariable UUID id) {
        kbService.markNotHelpful(id);
        return ResponseEntity.ok().build();
    }
}


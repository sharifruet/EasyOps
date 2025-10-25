package com.easyops.hr.controller;

import com.easyops.hr.entity.Competency;
import com.easyops.hr.entity.PerformanceCycle;
import com.easyops.hr.entity.PerformanceReview;
import com.easyops.hr.entity.ReviewRating;
import com.easyops.hr.service.PerformanceReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/performance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PerformanceReviewController {
    
    private final PerformanceReviewService performanceReviewService;
    
    // Cycle Management
    @GetMapping("/cycles")
    public ResponseEntity<List<PerformanceCycle>> getAllCycles(@RequestParam UUID organizationId) {
        log.info("GET /performance/cycles - organizationId: {}", organizationId);
        List<PerformanceCycle> cycles = performanceReviewService.getAllCycles(organizationId);
        return ResponseEntity.ok(cycles);
    }
    
    @PostMapping("/cycles")
    public ResponseEntity<PerformanceCycle> createCycle(@RequestBody PerformanceCycle cycle) {
        log.info("POST /performance/cycles - Creating cycle: {}", cycle.getCycleName());
        PerformanceCycle created = performanceReviewService.createCycle(cycle);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/cycles/{id}")
    public ResponseEntity<PerformanceCycle> updateCycle(
            @PathVariable UUID id,
            @RequestBody PerformanceCycle cycle) {
        log.info("PUT /performance/cycles/{}", id);
        PerformanceCycle updated = performanceReviewService.updateCycle(id, cycle);
        return ResponseEntity.ok(updated);
    }
    
    // Review Management
    @GetMapping("/reviews")
    public ResponseEntity<List<PerformanceReview>> getAllReviews(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId) {
        
        log.info("GET /performance/reviews - organizationId: {}, employeeId: {}", 
                organizationId, employeeId);
        
        List<PerformanceReview> reviews;
        
        if (employeeId != null) {
            reviews = performanceReviewService.getEmployeeReviews(employeeId, organizationId);
        } else {
            reviews = performanceReviewService.getAllReviews(organizationId);
        }
        
        return ResponseEntity.ok(reviews);
    }
    
    @GetMapping("/reviews/{id}")
    public ResponseEntity<PerformanceReview> getReviewById(@PathVariable UUID id) {
        log.info("GET /performance/reviews/{}", id);
        PerformanceReview review = performanceReviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }
    
    @PostMapping("/reviews")
    public ResponseEntity<PerformanceReview> createReview(@RequestBody PerformanceReview review) {
        log.info("POST /performance/reviews - Creating review for employee: {}", review.getEmployeeId());
        PerformanceReview created = performanceReviewService.createReview(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/reviews/{id}")
    public ResponseEntity<PerformanceReview> updateReview(
            @PathVariable UUID id,
            @RequestBody PerformanceReview review) {
        log.info("PUT /performance/reviews/{}", id);
        PerformanceReview updated = performanceReviewService.updateReview(id, review);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/reviews/{id}/submit")
    public ResponseEntity<PerformanceReview> submitReview(@PathVariable UUID id) {
        log.info("POST /performance/reviews/{}/submit", id);
        PerformanceReview submitted = performanceReviewService.submitReview(id);
        return ResponseEntity.ok(submitted);
    }
    
    @PostMapping("/reviews/{id}/approve")
    public ResponseEntity<PerformanceReview> approveReview(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy"));
        log.info("POST /performance/reviews/{}/approve - approvedBy: {}", id, approvedBy);
        PerformanceReview approved = performanceReviewService.approveReview(id, approvedBy);
        return ResponseEntity.ok(approved);
    }
    
    // Competency Management
    @GetMapping("/competencies")
    public ResponseEntity<List<Competency>> getAllCompetencies(@RequestParam UUID organizationId) {
        log.info("GET /performance/competencies - organizationId: {}", organizationId);
        List<Competency> competencies = performanceReviewService.getAllCompetencies(organizationId);
        return ResponseEntity.ok(competencies);
    }
    
    @PostMapping("/competencies")
    public ResponseEntity<Competency> createCompetency(@RequestBody Competency competency) {
        log.info("POST /performance/competencies - Creating competency: {}", competency.getCompetencyName());
        Competency created = performanceReviewService.createCompetency(competency);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    // Rating Management
    @PostMapping("/reviews/{reviewId}/ratings")
    public ResponseEntity<ReviewRating> addRating(
            @PathVariable UUID reviewId,
            @RequestBody ReviewRating rating) {
        
        rating.setReviewId(reviewId);
        log.info("POST /performance/reviews/{}/ratings", reviewId);
        ReviewRating created = performanceReviewService.addRating(rating);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/reviews/{reviewId}/ratings")
    public ResponseEntity<List<ReviewRating>> getReviewRatings(@PathVariable UUID reviewId) {
        log.info("GET /performance/reviews/{}/ratings", reviewId);
        List<ReviewRating> ratings = performanceReviewService.getReviewRatings(reviewId);
        return ResponseEntity.ok(ratings);
    }
}


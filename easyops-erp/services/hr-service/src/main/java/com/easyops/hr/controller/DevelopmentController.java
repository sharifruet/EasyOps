package com.easyops.hr.controller;

import com.easyops.hr.entity.DevelopmentPlan;
import com.easyops.hr.entity.Feedback360;
import com.easyops.hr.entity.OneOnOneMeeting;
import com.easyops.hr.entity.TrainingCertification;
import com.easyops.hr.service.DevelopmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/development")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DevelopmentController {
    
    private final DevelopmentService developmentService;
    
    // Development Plans
    @GetMapping("/plans")
    public ResponseEntity<List<DevelopmentPlan>> getAllDevelopmentPlans(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId) {
        
        log.info("GET /development/plans - organizationId: {}, employeeId: {}", 
                organizationId, employeeId);
        
        List<DevelopmentPlan> plans;
        
        if (employeeId != null) {
            plans = developmentService.getEmployeeDevelopmentPlans(employeeId, organizationId);
        } else {
            plans = developmentService.getAllDevelopmentPlans(organizationId);
        }
        
        return ResponseEntity.ok(plans);
    }
    
    @GetMapping("/plans/{id}")
    public ResponseEntity<DevelopmentPlan> getDevelopmentPlanById(@PathVariable UUID id) {
        log.info("GET /development/plans/{}", id);
        DevelopmentPlan plan = developmentService.getDevelopmentPlanById(id);
        return ResponseEntity.ok(plan);
    }
    
    @PostMapping("/plans")
    public ResponseEntity<DevelopmentPlan> createDevelopmentPlan(@RequestBody DevelopmentPlan plan) {
        log.info("POST /development/plans - Creating plan: {}", plan.getPlanName());
        DevelopmentPlan created = developmentService.createDevelopmentPlan(plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/plans/{id}")
    public ResponseEntity<DevelopmentPlan> updateDevelopmentPlan(
            @PathVariable UUID id,
            @RequestBody DevelopmentPlan plan) {
        log.info("PUT /development/plans/{}", id);
        DevelopmentPlan updated = developmentService.updateDevelopmentPlan(id, plan);
        return ResponseEntity.ok(updated);
    }
    
    // Training & Certifications
    @GetMapping("/training")
    public ResponseEntity<List<TrainingCertification>> getAllTrainings(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId) {
        
        log.info("GET /development/training - organizationId: {}, employeeId: {}", 
                organizationId, employeeId);
        
        List<TrainingCertification> trainings;
        
        if (employeeId != null) {
            trainings = developmentService.getEmployeeTrainings(employeeId, organizationId);
        } else {
            trainings = developmentService.getAllTrainings(organizationId);
        }
        
        return ResponseEntity.ok(trainings);
    }
    
    @PostMapping("/training")
    public ResponseEntity<TrainingCertification> createTraining(@RequestBody TrainingCertification training) {
        log.info("POST /development/training - Creating training: {}", training.getTrainingName());
        TrainingCertification created = developmentService.createTraining(training);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/training/{id}")
    public ResponseEntity<TrainingCertification> updateTraining(
            @PathVariable UUID id,
            @RequestBody TrainingCertification training) {
        log.info("PUT /development/training/{}", id);
        TrainingCertification updated = developmentService.updateTraining(id, training);
        return ResponseEntity.ok(updated);
    }
    
    // One-on-One Meetings
    @GetMapping("/one-on-ones")
    public ResponseEntity<List<OneOnOneMeeting>> getAllOneOnOnes(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId) {
        
        log.info("GET /development/one-on-ones - organizationId: {}, employeeId: {}", 
                organizationId, employeeId);
        
        List<OneOnOneMeeting> meetings;
        
        if (employeeId != null) {
            meetings = developmentService.getEmployeeOneOnOnes(employeeId, organizationId);
        } else {
            meetings = developmentService.getAllOneOnOnes(organizationId);
        }
        
        return ResponseEntity.ok(meetings);
    }
    
    @PostMapping("/one-on-ones")
    public ResponseEntity<OneOnOneMeeting> createOneOnOne(@RequestBody OneOnOneMeeting meeting) {
        log.info("POST /development/one-on-ones - Scheduling meeting for employee: {}", 
                meeting.getEmployeeId());
        OneOnOneMeeting created = developmentService.createOneOnOne(meeting);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/one-on-ones/{id}")
    public ResponseEntity<OneOnOneMeeting> updateOneOnOne(
            @PathVariable UUID id,
            @RequestBody OneOnOneMeeting meeting) {
        log.info("PUT /development/one-on-ones/{}", id);
        OneOnOneMeeting updated = developmentService.updateOneOnOne(id, meeting);
        return ResponseEntity.ok(updated);
    }
    
    // 360 Feedback
    @GetMapping("/feedback360")
    public ResponseEntity<List<Feedback360>> getEmployeeFeedback(
            @RequestParam UUID employeeId,
            @RequestParam UUID organizationId) {
        
        log.info("GET /development/feedback360 - employeeId: {}", employeeId);
        List<Feedback360> feedback = developmentService.getEmployeeFeedback(employeeId, organizationId);
        return ResponseEntity.ok(feedback);
    }
    
    @PostMapping("/feedback360")
    public ResponseEntity<Feedback360> submitFeedback(@RequestBody Feedback360 feedback) {
        log.info("POST /development/feedback360 - Submitting feedback for employee: {}", 
                feedback.getEmployeeId());
        Feedback360 submitted = developmentService.submitFeedback(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(submitted);
    }
}


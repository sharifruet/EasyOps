package com.easyops.hr.controller;

import com.easyops.hr.entity.Goal;
import com.easyops.hr.entity.GoalUpdate;
import com.easyops.hr.service.GoalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/goals")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GoalController {
    
    private final GoalService goalService;
    
    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /goals - organizationId: {}, employeeId: {}, status: {}", 
                organizationId, employeeId, status);
        
        List<Goal> goals;
        
        if (employeeId != null) {
            goals = goalService.getEmployeeGoals(employeeId, organizationId);
        } else if (status != null) {
            goals = goalService.getGoalsByStatus(organizationId, status);
        } else {
            goals = goalService.getAllGoals(organizationId);
        }
        
        return ResponseEntity.ok(goals);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Goal> getGoalById(@PathVariable UUID id) {
        log.info("GET /goals/{}", id);
        Goal goal = goalService.getGoalById(id);
        return ResponseEntity.ok(goal);
    }
    
    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<Goal>> getCycleGoals(@PathVariable UUID cycleId) {
        log.info("GET /goals/cycle/{}", cycleId);
        List<Goal> goals = goalService.getCycleGoals(cycleId);
        return ResponseEntity.ok(goals);
    }
    
    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody Goal goal) {
        log.info("POST /goals - Creating goal: {}", goal.getGoalTitle());
        Goal created = goalService.createGoal(goal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(
            @PathVariable UUID id,
            @RequestBody Goal goal) {
        log.info("PUT /goals/{}", id);
        Goal updated = goalService.updateGoal(id, goal);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{id}/update-progress")
    public ResponseEntity<Goal> updateGoalProgress(
            @PathVariable UUID id,
            @RequestBody GoalUpdate update) {
        log.info("POST /goals/{}/update-progress", id);
        Goal updated = goalService.updateGoalProgress(id, update);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{id}/complete")
    public ResponseEntity<Goal> completeGoal(@PathVariable UUID id) {
        log.info("POST /goals/{}/complete", id);
        Goal completed = goalService.completeGoal(id);
        return ResponseEntity.ok(completed);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable UUID id) {
        log.info("DELETE /goals/{}", id);
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/updates")
    public ResponseEntity<List<GoalUpdate>> getGoalUpdates(@PathVariable UUID id) {
        log.info("GET /goals/{}/updates", id);
        List<GoalUpdate> updates = goalService.getGoalUpdates(id);
        return ResponseEntity.ok(updates);
    }
}


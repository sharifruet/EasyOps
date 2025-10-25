package com.easyops.crm.controller;

import com.easyops.crm.entity.Task;
import com.easyops.crm.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        
        List<Task> tasks;
        
        if (assignedTo != null) {
            tasks = taskService.getTasksByAssignedUser(organizationId, assignedTo);
        } else if (status != null) {
            tasks = taskService.getTasksByStatus(organizationId, status);
        } else if (priority != null) {
            tasks = taskService.getTasksByPriority(organizationId, priority);
        } else {
            tasks = taskService.getAllTasks(organizationId);
        }
        
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable UUID id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task created = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable UUID id,
            @RequestBody Task task) {
        try {
            Task updated = taskService.updateTask(id, task);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/due-today")
    public ResponseEntity<List<Task>> getTasksDueToday(
            @RequestParam UUID organizationId,
            @RequestParam UUID userId) {
        List<Task> tasks = taskService.getTasksDueToday(organizationId, userId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<Task>> getOverdueTasks(
            @RequestParam UUID organizationId,
            @RequestParam UUID userId) {
        List<Task> tasks = taskService.getOverdueTasks(organizationId, userId);
        return ResponseEntity.ok(tasks);
    }
    
    @PostMapping("/{id}/complete")
    public ResponseEntity<Task> completeTask(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            UUID completedBy = UUID.fromString(request.get("completedBy").toString());
            String notes = request.get("notes") != null ? request.get("notes").toString() : null;
            Task updated = taskService.completeTask(id, completedBy, notes);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTaskStats(
            @RequestParam UUID organizationId,
            @RequestParam UUID userId) {
        Map<String, Object> stats = taskService.getTaskStats(organizationId, userId);
        return ResponseEntity.ok(stats);
    }
}


package com.easyops.hr.controller;

import com.easyops.hr.entity.Timesheet;
import com.easyops.hr.service.TimesheetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/timesheets")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TimesheetController {
    
    private final TimesheetService timesheetService;
    
    @GetMapping
    public ResponseEntity<List<Timesheet>> getAllTimesheets(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /timesheets - organizationId: {}, employeeId: {}, status: {}", 
                organizationId, employeeId, status);
        
        List<Timesheet> timesheets;
        
        if (status != null && "pending".equals(status)) {
            timesheets = timesheetService.getPendingTimesheets(organizationId);
        } else if (employeeId != null) {
            timesheets = timesheetService.getEmployeeTimesheets(employeeId, organizationId);
        } else {
            timesheets = timesheetService.getAllTimesheets(organizationId);
        }
        
        return ResponseEntity.ok(timesheets);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Timesheet> getTimesheetById(@PathVariable UUID id) {
        log.info("GET /timesheets/{}", id);
        Timesheet timesheet = timesheetService.getTimesheetById(id);
        return ResponseEntity.ok(timesheet);
    }
    
    @PostMapping
    public ResponseEntity<Timesheet> createTimesheet(@RequestBody Timesheet timesheet) {
        log.info("POST /timesheets - Creating timesheet for employee: {}", timesheet.getEmployeeId());
        Timesheet created = timesheetService.createTimesheet(timesheet);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Timesheet> updateTimesheet(
            @PathVariable UUID id,
            @RequestBody Timesheet timesheet) {
        log.info("PUT /timesheets/{}", id);
        Timesheet updated = timesheetService.updateTimesheet(id, timesheet);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{id}/submit")
    public ResponseEntity<Timesheet> submitTimesheet(@PathVariable UUID id) {
        log.info("POST /timesheets/{}/submit", id);
        Timesheet submitted = timesheetService.submitTimesheet(id);
        return ResponseEntity.ok(submitted);
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<Timesheet> approveTimesheet(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy"));
        log.info("POST /timesheets/{}/approve - approvedBy: {}", id, approvedBy);
        Timesheet approved = timesheetService.approveTimesheet(id, approvedBy);
        return ResponseEntity.ok(approved);
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<Timesheet> rejectTimesheet(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID rejectedBy = UUID.fromString(request.get("rejectedBy"));
        String rejectionReason = request.get("rejectionReason");
        
        log.info("POST /timesheets/{}/reject - rejectedBy: {}", id, rejectedBy);
        Timesheet rejected = timesheetService.rejectTimesheet(id, rejectedBy, rejectionReason);
        return ResponseEntity.ok(rejected);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimesheet(@PathVariable UUID id) {
        log.info("DELETE /timesheets/{}", id);
        timesheetService.deleteTimesheet(id);
        return ResponseEntity.noContent().build();
    }
}


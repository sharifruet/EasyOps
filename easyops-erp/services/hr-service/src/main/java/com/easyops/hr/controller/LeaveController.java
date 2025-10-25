package com.easyops.hr.controller;

import com.easyops.hr.entity.LeaveBalance;
import com.easyops.hr.entity.LeaveRequest;
import com.easyops.hr.entity.LeaveType;
import com.easyops.hr.service.LeaveService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/leave")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LeaveController {
    
    private final LeaveService leaveService;
    
    // Leave Types
    @GetMapping("/types")
    public ResponseEntity<List<LeaveType>> getAllLeaveTypes(@RequestParam UUID organizationId) {
        log.info("GET /leave/types - organizationId: {}", organizationId);
        List<LeaveType> leaveTypes = leaveService.getAllLeaveTypes(organizationId);
        return ResponseEntity.ok(leaveTypes);
    }
    
    @PostMapping("/types")
    public ResponseEntity<LeaveType> createLeaveType(@RequestBody LeaveType leaveType) {
        log.info("POST /leave/types - Creating leave type: {}", leaveType.getTypeName());
        LeaveType created = leaveService.createLeaveType(leaveType);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/types/{id}")
    public ResponseEntity<LeaveType> updateLeaveType(
            @PathVariable UUID id,
            @RequestBody LeaveType leaveType) {
        log.info("PUT /leave/types/{}", id);
        LeaveType updated = leaveService.updateLeaveType(id, leaveType);
        return ResponseEntity.ok(updated);
    }
    
    // Leave Requests
    @GetMapping("/requests")
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /leave/requests - organizationId: {}, employeeId: {}, status: {}", 
                organizationId, employeeId, status);
        
        List<LeaveRequest> requests;
        
        if (status != null && "pending".equals(status)) {
            requests = leaveService.getPendingLeaveRequests(organizationId);
        } else if (employeeId != null) {
            requests = leaveService.getEmployeeLeaveRequests(employeeId, organizationId);
        } else {
            requests = leaveService.getAllLeaveRequests(organizationId);
        }
        
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/requests/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable UUID id) {
        log.info("GET /leave/requests/{}", id);
        LeaveRequest request = leaveService.getLeaveRequestById(id);
        return ResponseEntity.ok(request);
    }
    
    @PostMapping("/requests")
    public ResponseEntity<LeaveRequest> createLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        log.info("POST /leave/requests - Creating leave request for employee: {}", 
                leaveRequest.getEmployeeId());
        LeaveRequest created = leaveService.createLeaveRequest(leaveRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID approvedBy = UUID.fromString(request.get("approvedBy"));
        log.info("POST /leave/requests/{}/approve - approvedBy: {}", id, approvedBy);
        LeaveRequest approved = leaveService.approveLeaveRequest(id, approvedBy);
        return ResponseEntity.ok(approved);
    }
    
    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectLeaveRequest(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        UUID rejectedBy = UUID.fromString(request.get("rejectedBy"));
        String rejectionReason = request.get("rejectionReason");
        
        log.info("POST /leave/requests/{}/reject - rejectedBy: {}", id, rejectedBy);
        LeaveRequest rejected = leaveService.rejectLeaveRequest(id, rejectedBy, rejectionReason);
        return ResponseEntity.ok(rejected);
    }
    
    // Leave Balances
    @GetMapping("/balances")
    public ResponseEntity<List<LeaveBalance>> getEmployeeLeaveBalances(
            @RequestParam UUID employeeId,
            @RequestParam UUID organizationId) {
        
        log.info("GET /leave/balances - employeeId: {}", employeeId);
        List<LeaveBalance> balances = leaveService.getEmployeeLeaveBalances(employeeId, organizationId);
        return ResponseEntity.ok(balances);
    }
    
    @PostMapping("/balances")
    public ResponseEntity<LeaveBalance> createLeaveBalance(@RequestBody LeaveBalance balance) {
        log.info("POST /leave/balances - Creating leave balance");
        LeaveBalance created = leaveService.createLeaveBalance(balance);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}


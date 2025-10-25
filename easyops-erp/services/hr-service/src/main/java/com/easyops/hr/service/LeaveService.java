package com.easyops.hr.service;

import com.easyops.hr.entity.LeaveBalance;
import com.easyops.hr.entity.LeaveRequest;
import com.easyops.hr.entity.LeaveType;
import com.easyops.hr.repository.LeaveBalanceRepository;
import com.easyops.hr.repository.LeaveRequestRepository;
import com.easyops.hr.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeaveService {
    
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    
    // Leave Type Methods
    public List<LeaveType> getAllLeaveTypes(UUID organizationId) {
        return leaveTypeRepository.findByOrganizationId(organizationId);
    }
    
    public LeaveType createLeaveType(LeaveType leaveType) {
        return leaveTypeRepository.save(leaveType);
    }
    
    public LeaveType updateLeaveType(UUID leaveTypeId, LeaveType leaveType) {
        LeaveType existing = leaveTypeRepository.findById(leaveTypeId)
                .orElseThrow(() -> new RuntimeException("Leave type not found"));
        
        if (leaveType.getTypeName() != null) existing.setTypeName(leaveType.getTypeName());
        if (leaveType.getDescription() != null) existing.setDescription(leaveType.getDescription());
        if (leaveType.getIsPaid() != null) existing.setIsPaid(leaveType.getIsPaid());
        if (leaveType.getMaxDaysPerYear() != null) existing.setMaxDaysPerYear(leaveType.getMaxDaysPerYear());
        if (leaveType.getRequiresApproval() != null) existing.setRequiresApproval(leaveType.getRequiresApproval());
        if (leaveType.getCarryForward() != null) existing.setCarryForward(leaveType.getCarryForward());
        if (leaveType.getIsActive() != null) existing.setIsActive(leaveType.getIsActive());
        
        return leaveTypeRepository.save(existing);
    }
    
    // Leave Request Methods
    public List<LeaveRequest> getAllLeaveRequests(UUID organizationId) {
        return leaveRequestRepository.findByOrganizationId(organizationId);
    }
    
    public LeaveRequest getLeaveRequestById(UUID leaveRequestId) {
        return leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
    }
    
    public List<LeaveRequest> getEmployeeLeaveRequests(UUID employeeId, UUID organizationId) {
        return leaveRequestRepository.findByEmployeeIdAndOrganizationId(employeeId, organizationId);
    }
    
    public List<LeaveRequest> getPendingLeaveRequests(UUID organizationId) {
        return leaveRequestRepository.findByOrganizationIdAndStatus(organizationId, "pending");
    }
    
    public LeaveRequest createLeaveRequest(LeaveRequest leaveRequest) {
        log.info("Creating leave request for employee: {}", leaveRequest.getEmployeeId());
        leaveRequest.setStatus("pending");
        return leaveRequestRepository.save(leaveRequest);
    }
    
    public LeaveRequest approveLeaveRequest(UUID leaveRequestId, UUID approvedBy) {
        LeaveRequest request = getLeaveRequestById(leaveRequestId);
        request.setStatus("approved");
        request.setApprovedBy(approvedBy);
        request.setApprovedAt(LocalDateTime.now());
        
        // Update leave balance
        updateLeaveBalance(request.getEmployeeId(), request.getLeaveTypeId(), request.getTotalDays());
        
        return leaveRequestRepository.save(request);
    }
    
    public LeaveRequest rejectLeaveRequest(UUID leaveRequestId, UUID rejectedBy, String rejectionReason) {
        LeaveRequest request = getLeaveRequestById(leaveRequestId);
        request.setStatus("rejected");
        request.setApprovedBy(rejectedBy);
        request.setApprovedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);
        
        return leaveRequestRepository.save(request);
    }
    
    // Leave Balance Methods
    public List<LeaveBalance> getEmployeeLeaveBalances(UUID employeeId, UUID organizationId) {
        return leaveBalanceRepository.findByEmployeeIdAndOrganizationId(employeeId, organizationId);
    }
    
    public LeaveBalance getLeaveBalance(UUID employeeId, UUID leaveTypeId, Integer year) {
        return leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, year)
                .orElse(null);
    }
    
    public LeaveBalance createLeaveBalance(LeaveBalance balance) {
        return leaveBalanceRepository.save(balance);
    }
    
    private void updateLeaveBalance(UUID employeeId, UUID leaveTypeId, BigDecimal days) {
        int currentYear = java.time.Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, currentYear)
                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
        
        balance.setUsedDays(balance.getUsedDays().add(days));
        leaveBalanceRepository.save(balance);
    }
}


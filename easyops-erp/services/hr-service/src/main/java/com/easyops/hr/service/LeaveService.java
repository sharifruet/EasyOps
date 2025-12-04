package com.easyops.hr.service;

import com.easyops.hr.entity.LeaveBalance;
import com.easyops.hr.entity.LeaveRequest;
import com.easyops.hr.entity.LeaveType;
import com.easyops.hr.repository.LeaveBalanceRepository;
import com.easyops.hr.repository.LeaveRequestRepository;
import com.easyops.hr.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeaveService {
    
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    
    // Per-organization locks to prevent concurrent seeding
    private final ConcurrentHashMap<UUID, ReentrantLock> seedingLocks = new ConcurrentHashMap<>();
    
    // Leave Type Methods
    public List<LeaveType> getAllLeaveTypes(UUID organizationId) {
        List<LeaveType> types = leaveTypeRepository.findByOrganizationId(organizationId);
        if (types.isEmpty()) {
            types = seedDefaultLeaveTypesSafely(organizationId);
        }
        return types;
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

    /**
     * Safely seed default leave types with proper synchronization to prevent race conditions.
     * Uses per-organization locks to ensure only one thread seeds leave types for a given organization.
     */
    private List<LeaveType> seedDefaultLeaveTypesSafely(UUID organizationId) {
        // Get or create a lock for this organization
        ReentrantLock lock = seedingLocks.computeIfAbsent(organizationId, k -> new ReentrantLock());
        
        lock.lock();
        try {
            // Double-check after acquiring lock - another thread might have seeded while we waited
            List<LeaveType> existing = leaveTypeRepository.findByOrganizationId(organizationId);
            if (!existing.isEmpty()) {
                log.debug("Leave types already seeded for organization {} (found by another thread)", organizationId);
                return existing;
            }
            
            // Attempt to seed
            return seedDefaultLeaveTypes(organizationId);
        } catch (DataIntegrityViolationException e) {
            // Another thread might have inserted between our check and insert
            // This is safe - just return what's in the database now
            log.warn("Duplicate key violation while seeding leave types for organization {} - another thread may have seeded. Retrying query.", organizationId);
            return leaveTypeRepository.findByOrganizationId(organizationId);
        } finally {
            lock.unlock();
            // Clean up lock if no longer needed (optional optimization)
            if (!lock.hasQueuedThreads()) {
                seedingLocks.remove(organizationId);
            }
        }
    }
    
    private List<LeaveType> seedDefaultLeaveTypes(UUID organizationId) {
        log.info("Seeding default leave types for organization {}", organizationId);
        List<LeaveType> defaults = List.of(
                buildLeaveType(organizationId, "Annual Leave", "Paid time off for planned vacations and personal days.", true, 20, true, true),
                buildLeaveType(organizationId, "Sick Leave", "Paid leave for illness or medical appointments.", true, 12, true, false),
                buildLeaveType(organizationId, "Casual Leave", "Short notice leave for personal errands and emergencies.", true, 7, true, false),
                buildLeaveType(organizationId, "Unpaid Leave", "Unpaid leave for special circumstances.", false, 30, true, false)
        );
        return leaveTypeRepository.saveAll(defaults);
    }

    private LeaveType buildLeaveType(UUID organizationId,
                                     String name,
                                     String description,
                                     boolean isPaid,
                                     Integer maxDays,
                                     boolean requiresApproval,
                                     boolean carryForward) {
        LeaveType leaveType = new LeaveType();
        leaveType.setOrganizationId(organizationId);
        leaveType.setTypeName(name);
        leaveType.setDescription(description);
        leaveType.setIsPaid(isPaid);
        leaveType.setMaxDaysPerYear(maxDays);
        leaveType.setRequiresApproval(requiresApproval);
        leaveType.setCarryForward(carryForward);
        leaveType.setIsActive(true);
        leaveType.setCreatedBy("system-bootstrap");
        leaveType.setUpdatedBy("system-bootstrap");
        return leaveType;
    }
}


package com.easyops.hr.service;

import com.easyops.hr.entity.Bonus;
import com.easyops.hr.entity.Reimbursement;
import com.easyops.hr.repository.BonusRepository;
import com.easyops.hr.repository.ReimbursementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CompensationService {
    
    private final ReimbursementRepository reimbursementRepository;
    private final BonusRepository bonusRepository;
    
    // Reimbursement Methods
    public List<Reimbursement> getAllReimbursements(UUID organizationId) {
        return reimbursementRepository.findByOrganizationId(organizationId);
    }
    
    public List<Reimbursement> getEmployeeReimbursements(UUID employeeId, UUID organizationId) {
        return reimbursementRepository.findByEmployeeIdAndOrganizationId(employeeId, organizationId);
    }
    
    public List<Reimbursement> getPendingReimbursements(UUID organizationId) {
        return reimbursementRepository.findByOrganizationIdAndStatus(organizationId, "pending");
    }
    
    public Reimbursement createReimbursement(Reimbursement reimbursement) {
        log.info("Creating reimbursement for employee: {}", reimbursement.getEmployeeId());
        reimbursement.setStatus("pending");
        return reimbursementRepository.save(reimbursement);
    }
    
    public Reimbursement approveReimbursement(UUID reimbursementId, UUID approvedBy) {
        Reimbursement reimbursement = reimbursementRepository.findById(reimbursementId)
                .orElseThrow(() -> new RuntimeException("Reimbursement not found"));
        
        reimbursement.setStatus("approved");
        reimbursement.setApprovedBy(approvedBy);
        reimbursement.setApprovedAt(LocalDateTime.now());
        
        return reimbursementRepository.save(reimbursement);
    }
    
    public Reimbursement rejectReimbursement(UUID reimbursementId, UUID rejectedBy, String rejectionReason) {
        Reimbursement reimbursement = reimbursementRepository.findById(reimbursementId)
                .orElseThrow(() -> new RuntimeException("Reimbursement not found"));
        
        reimbursement.setStatus("rejected");
        reimbursement.setApprovedBy(rejectedBy);
        reimbursement.setApprovedAt(LocalDateTime.now());
        reimbursement.setRejectionReason(rejectionReason);
        
        return reimbursementRepository.save(reimbursement);
    }
    
    // Bonus Methods
    public List<Bonus> getAllBonuses(UUID organizationId) {
        return bonusRepository.findByOrganizationId(organizationId);
    }
    
    public List<Bonus> getEmployeeBonuses(UUID employeeId, UUID organizationId) {
        return bonusRepository.findByEmployeeIdAndOrganizationId(employeeId, organizationId);
    }
    
    public List<Bonus> getPendingBonuses(UUID organizationId) {
        return bonusRepository.findByOrganizationIdAndStatus(organizationId, "pending");
    }
    
    public Bonus createBonus(Bonus bonus) {
        log.info("Creating bonus for employee: {}", bonus.getEmployeeId());
        bonus.setStatus("pending");
        return bonusRepository.save(bonus);
    }
    
    public Bonus approveBonus(UUID bonusId, UUID approvedBy) {
        Bonus bonus = bonusRepository.findById(bonusId)
                .orElseThrow(() -> new RuntimeException("Bonus not found"));
        
        bonus.setStatus("approved");
        bonus.setApprovedBy(approvedBy);
        bonus.setApprovedAt(LocalDateTime.now());
        
        return bonusRepository.save(bonus);
    }
}


package com.easyops.accounting.service;

import com.easyops.accounting.entity.Period;
import com.easyops.accounting.repository.PeriodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PeriodService {
    
    private final PeriodRepository periodRepository;
    
    public Period getPeriodById(UUID periodId) {
        return periodRepository.findById(periodId)
            .orElseThrow(() -> new RuntimeException("Period not found"));
    }
    
    public Period getPeriodForDate(UUID organizationId, LocalDate date) {
        return periodRepository.findByOrganizationIdAndDate(organizationId, date)
            .orElseThrow(() -> new RuntimeException("No period found for date: " + date));
    }
    
    public List<Period> getOrganizationPeriods(UUID organizationId) {
        return periodRepository.findByOrganizationIdOrderByPeriodNumber(organizationId);
    }
    
    public List<Period> getOpenPeriods(UUID organizationId) {
        return periodRepository.findOpenPeriods(organizationId);
    }
    
    @Transactional
    public Period closePeriod(UUID periodId, UUID closedBy) {
        Period period = getPeriodById(periodId);
        
        if ("CLOSED".equals(period.getStatus()) || "LOCKED".equals(period.getStatus())) {
            throw new RuntimeException("Period is already closed or locked");
        }
        
        period.setStatus("CLOSED");
        period.setClosedAt(LocalDateTime.now());
        period.setClosedBy(closedBy);
        
        period = periodRepository.save(period);
        log.info("Closed period: {}", period.getPeriodName());
        
        return period;
    }
    
    @Transactional
    public Period reopenPeriod(UUID periodId) {
        Period period = getPeriodById(periodId);
        
        if ("LOCKED".equals(period.getStatus())) {
            throw new RuntimeException("Cannot reopen a locked period");
        }
        
        period.setStatus("OPEN");
        period.setClosedAt(null);
        period.setClosedBy(null);
        
        period = periodRepository.save(period);
        log.info("Reopened period: {}", period.getPeriodName());
        
        return period;
    }
}


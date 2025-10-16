package com.easyops.accounting.controller;

import com.easyops.accounting.entity.FiscalYear;
import com.easyops.accounting.entity.Period;
import com.easyops.accounting.service.FiscalYearService;
import com.easyops.accounting.service.PeriodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/fiscal-years")
@RequiredArgsConstructor
@Tag(name = "Fiscal Years", description = "Fiscal year and period management")
public class FiscalYearController {
    
    private final FiscalYearService fiscalYearService;
    private final PeriodService periodService;
    
    @PostMapping("/organization/{organizationId}/setup-current-year")
    @Operation(summary = "Quick setup - Create current fiscal year with 12 monthly periods")
    public ResponseEntity<FiscalYear> setupCurrentFiscalYear(@PathVariable UUID organizationId) {
        try {
            FiscalYear fiscalYear = fiscalYearService.createCurrentFiscalYearWithPeriods(organizationId);
            return ResponseEntity.status(HttpStatus.CREATED).body(fiscalYear);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/organization/{organizationId}")
    @Operation(summary = "Create a fiscal year")
    public ResponseEntity<FiscalYear> createFiscalYear(
            @PathVariable UUID organizationId,
            @RequestParam String yearCode,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            FiscalYear fiscalYear = fiscalYearService.createFiscalYear(
                organizationId, 
                yearCode, 
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(fiscalYear);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{fiscalYearId}/generate-periods")
    @Operation(summary = "Generate monthly periods for a fiscal year")
    public ResponseEntity<List<Period>> generatePeriods(
            @PathVariable UUID fiscalYearId,
            @RequestParam UUID organizationId) {
        List<Period> periods = fiscalYearService.generateMonthlyPeriods(fiscalYearId, organizationId);
        return ResponseEntity.ok(periods);
    }
    
    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get all fiscal years for organization")
    public ResponseEntity<List<FiscalYear>> getFiscalYears(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(fiscalYearService.getOrganizationFiscalYears(organizationId));
    }
    
    @GetMapping("/organization/{organizationId}/open")
    @Operation(summary = "Get open fiscal years")
    public ResponseEntity<List<FiscalYear>> getOpenFiscalYears(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(fiscalYearService.getOpenFiscalYears(organizationId));
    }
    
    @GetMapping("/{fiscalYearId}")
    @Operation(summary = "Get fiscal year by ID")
    public ResponseEntity<FiscalYear> getFiscalYear(@PathVariable UUID fiscalYearId) {
        return ResponseEntity.ok(fiscalYearService.getFiscalYearById(fiscalYearId));
    }
    
    @GetMapping("/organization/{organizationId}/periods")
    @Operation(summary = "Get all periods for organization")
    public ResponseEntity<List<Period>> getPeriods(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(periodService.getOrganizationPeriods(organizationId));
    }
    
    @GetMapping("/organization/{organizationId}/periods/open")
    @Operation(summary = "Get open periods")
    public ResponseEntity<List<Period>> getOpenPeriods(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(periodService.getOpenPeriods(organizationId));
    }
    
    @PatchMapping("/periods/{periodId}/close")
    @Operation(summary = "Close a period")
    public ResponseEntity<Period> closePeriod(
            @PathVariable UUID periodId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.ok(periodService.closePeriod(periodId, userId));
    }
    
    @PatchMapping("/periods/{periodId}/reopen")
    @Operation(summary = "Reopen a closed period")
    public ResponseEntity<Period> reopenPeriod(@PathVariable UUID periodId) {
        return ResponseEntity.ok(periodService.reopenPeriod(periodId));
    }
    
    @PatchMapping("/{fiscalYearId}/close")
    @Operation(summary = "Close a fiscal year")
    public ResponseEntity<FiscalYear> closeFiscalYear(
            @PathVariable UUID fiscalYearId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.ok(fiscalYearService.closeFiscalYear(fiscalYearId, userId));
    }
}


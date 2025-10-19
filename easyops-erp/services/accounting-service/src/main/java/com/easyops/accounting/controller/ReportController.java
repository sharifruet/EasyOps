package com.easyops.accounting.controller;

import com.easyops.accounting.dto.*;
import com.easyops.accounting.service.FinancialReportService;
import com.easyops.accounting.service.TrialBalanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/reports")
@RequiredArgsConstructor
@Tag(name = "Accounting Reports", description = "Financial reports and statements")
public class ReportController {
    
    private final TrialBalanceService trialBalanceService;
    private final FinancialReportService financialReportService;
    
    @GetMapping("/trial-balance")
    @Operation(summary = "Get trial balance for a period")
    public ResponseEntity<List<TrialBalanceResponse>> getTrialBalance(
            @RequestParam UUID organizationId,
            @RequestParam UUID periodId) {
        return ResponseEntity.ok(trialBalanceService.getTrialBalance(organizationId, periodId));
    }
    
    @GetMapping("/general-ledger")
    @Operation(summary = "Get general ledger for an account")
    public ResponseEntity<List<GeneralLedgerResponse>> getGeneralLedger(
            @RequestParam UUID organizationId,
            @RequestParam UUID accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(financialReportService.getGeneralLedger(organizationId, accountId, startDate, endDate));
    }
    
    @GetMapping("/profit-loss")
    @Operation(summary = "Get Profit & Loss statement")
    public ResponseEntity<ProfitLossResponse> getProfitAndLoss(
            @RequestParam UUID organizationId,
            @RequestParam UUID periodId) {
        return ResponseEntity.ok(financialReportService.getProfitAndLoss(organizationId, periodId));
    }
    
    @GetMapping("/balance-sheet")
    @Operation(summary = "Get Balance Sheet")
    public ResponseEntity<BalanceSheetResponse> getBalanceSheet(
            @RequestParam UUID organizationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(financialReportService.getBalanceSheet(organizationId, asOfDate));
    }
    
    @GetMapping("/cash-flow")
    @Operation(summary = "Get Cash Flow statement")
    public ResponseEntity<CashFlowResponse> getCashFlow(
            @RequestParam UUID organizationId,
            @RequestParam UUID periodId) {
        return ResponseEntity.ok(financialReportService.getCashFlow(organizationId, periodId));
    }
}


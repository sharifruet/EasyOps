package com.easyops.accounting.controller;

import com.easyops.accounting.dto.TrialBalanceResponse;
import com.easyops.accounting.service.TrialBalanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/reports")
@RequiredArgsConstructor
@Tag(name = "Accounting Reports", description = "Financial reports and statements")
public class ReportController {
    
    private final TrialBalanceService trialBalanceService;
    
    @GetMapping("/trial-balance")
    @Operation(summary = "Get trial balance for a period")
    public ResponseEntity<List<TrialBalanceResponse>> getTrialBalance(
            @RequestParam UUID organizationId,
            @RequestParam UUID periodId) {
        return ResponseEntity.ok(trialBalanceService.getTrialBalance(organizationId, periodId));
    }
}


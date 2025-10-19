package com.easyops.ap.controller;

import com.easyops.ap.dto.AgingReportResponse;
import com.easyops.ap.service.AgingReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ap/aging")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AP Aging Reports", description = "Aging reports for Accounts Payable")
public class AgingReportController {
    
    private final AgingReportService agingReportService;
    
    @GetMapping
    @Operation(summary = "Generate AP aging report")
    public ResponseEntity<List<AgingReportResponse>> getAgingReport(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        
        log.info("GET /api/ap/aging - organizationId: {}, asOfDate: {}", organizationId, asOfDate);
        
        List<AgingReportResponse> report = agingReportService.generateAgingReport(organizationId, asOfDate);
        return ResponseEntity.ok(report);
    }
}


package com.easyops.manufacturing.controller;

import com.easyops.manufacturing.service.ManufacturingAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ManufacturingAnalyticsController {

    private final ManufacturingAnalyticsService analyticsService;

    /**
     * Get comprehensive manufacturing dashboard with all KPIs
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getManufacturingDashboard(
            @RequestParam UUID organizationId) {
        Map<String, Object> dashboard = analyticsService.getManufacturingDashboard(organizationId);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Calculate OEE (Overall Equipment Effectiveness)
     * OEE = Availability × Performance × Quality
     */
    @GetMapping("/oee")
    public ResponseEntity<Map<String, Object>> calculateOEE(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String workCenterCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Map<String, Object> oee = analyticsService.calculateOEE(organizationId, workCenterCode, date);
        return ResponseEntity.ok(oee);
    }

    /**
     * Get production trends over time
     */
    @GetMapping("/trends/production")
    public ResponseEntity<Map<String, Object>> getProductionTrends(
            @RequestParam UUID organizationId,
            @RequestParam(defaultValue = "DAILY") String period,
            @RequestParam(defaultValue = "30") int limit) {
        Map<String, Object> trends = analyticsService.getProductionTrends(organizationId, period, limit);
        return ResponseEntity.ok(trends);
    }

    /**
     * Get cost analysis by product
     */
    @GetMapping("/costs/by-product")
    public ResponseEntity<List<Map<String, Object>>> getCostAnalysisByProduct(
            @RequestParam UUID organizationId) {
        List<Map<String, Object>> analysis = analyticsService.getCostAnalysisByProduct(organizationId);
        return ResponseEntity.ok(analysis);
    }

    /**
     * Get quality metrics summary
     */
    @GetMapping("/quality/summary")
    public ResponseEntity<Map<String, Object>> getQualityMetricsSummary(
            @RequestParam UUID organizationId) {
        Map<String, Object> summary = analyticsService.getQualityMetricsSummary(organizationId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get production summary report
     */
    @GetMapping("/reports/production-summary")
    public ResponseEntity<Map<String, Object>> getProductionSummaryReport(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> report = analyticsService.getProductionSummaryReport(organizationId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Get work center performance report
     */
    @GetMapping("/work-centers/performance")
    public ResponseEntity<List<Map<String, Object>>> getWorkCenterPerformance(
            @RequestParam UUID organizationId) {
        List<Map<String, Object>> performance = analyticsService.getWorkCenterPerformance(organizationId);
        return ResponseEntity.ok(performance);
    }

    /**
     * Get non-conformance analytics
     */
    @GetMapping("/quality/non-conformances")
    public ResponseEntity<Map<String, Object>> getNonConformanceAnalytics(
            @RequestParam UUID organizationId) {
        Map<String, Object> analytics = analyticsService.getNonConformanceAnalytics(organizationId);
        return ResponseEntity.ok(analytics);
    }

    /**
     * Get manufacturing performance summary
     */
    @GetMapping("/performance/summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(
            @RequestParam UUID organizationId) {
        Map<String, Object> summary = analyticsService.getPerformanceSummary(organizationId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get shop floor dashboard (real-time active work orders)
     */
    @GetMapping("/shop-floor/dashboard")
    public ResponseEntity<List<Map<String, Object>>> getShopFloorDashboard(
            @RequestParam UUID organizationId) {
        List<Map<String, Object>> dashboard = analyticsService.getShopFloorDashboard(organizationId);
        return ResponseEntity.ok(dashboard);
    }
}


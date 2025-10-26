package com.easyops.manufacturing.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Integration service for Manufacturing <-> Accounting communication
 * Handles work order cost posting, WIP accounting, and variance posting
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountingIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${integration.accounting-service.url:http://ACCOUNTING-SERVICE}")
    private String accountingServiceUrl;

    /**
     * Post work-in-progress (WIP) entry when work order starts
     */
    public void postWIPEntry(String workOrderNumber, UUID productId, BigDecimal quantity,
                            BigDecimal materialCost, BigDecimal laborCost, BigDecimal overheadCost,
                            UUID organizationId) {
        try {
            String url = accountingServiceUrl + "/api/accounting/journal-entries/wip";
            
            Map<String, Object> request = new HashMap<>();
            request.put("organizationId", organizationId);
            request.put("referenceType", "WORK_ORDER");
            request.put("referenceNumber", workOrderNumber);
            request.put("description", "WIP - Work Order " + workOrderNumber);
            request.put("entryDate", LocalDateTime.now());
            request.put("materialCost", materialCost);
            request.put("laborCost", laborCost);
            request.put("overheadCost", overheadCost);
            request.put("totalCost", materialCost.add(laborCost).add(overheadCost));
            request.put("quantity", quantity);
            request.put("productId", productId);
            
            restTemplate.postForEntity(url, request, Map.class);
            
            log.info("Posted WIP entry for work order: {}", workOrderNumber);
        } catch (Exception e) {
            log.error("Failed to post WIP entry: {}", e.getMessage());
        }
    }

    /**
     * Post material issuance to GL (credit raw materials, debit WIP)
     */
    public void postMaterialIssuance(String workOrderNumber, UUID componentId, BigDecimal quantity,
                                    BigDecimal unitCost, UUID organizationId) {
        try {
            String url = accountingServiceUrl + "/api/accounting/journal-entries/material-issue";
            
            Map<String, Object> request = new HashMap<>();
            request.put("organizationId", organizationId);
            request.put("referenceType", "WORK_ORDER_MATERIAL");
            request.put("referenceNumber", workOrderNumber);
            request.put("description", "Material Issue - WO " + workOrderNumber);
            request.put("entryDate", LocalDateTime.now());
            request.put("productId", componentId);
            request.put("quantity", quantity);
            request.put("unitCost", unitCost);
            request.put("totalCost", quantity.multiply(unitCost));
            
            restTemplate.postForEntity(url, request, Map.class);
            
            log.info("Posted material issuance for work order: {}", workOrderNumber);
        } catch (Exception e) {
            log.error("Failed to post material issuance: {}", e.getMessage());
        }
    }

    /**
     * Post labor cost to GL (debit WIP, credit labor accrual)
     */
    public void postLaborCost(String workOrderNumber, BigDecimal laborCost, UUID organizationId) {
        try {
            String url = accountingServiceUrl + "/api/accounting/journal-entries/labor-cost";
            
            Map<String, Object> request = new HashMap<>();
            request.put("organizationId", organizationId);
            request.put("referenceType", "WORK_ORDER_LABOR");
            request.put("referenceNumber", workOrderNumber);
            request.put("description", "Labor Cost - WO " + workOrderNumber);
            request.put("entryDate", LocalDateTime.now());
            request.put("amount", laborCost);
            
            restTemplate.postForEntity(url, request, Map.class);
            
            log.info("Posted labor cost for work order: {}", workOrderNumber);
        } catch (Exception e) {
            log.error("Failed to post labor cost: {}", e.getMessage());
        }
    }

    /**
     * Post finished goods completion (debit finished goods, credit WIP)
     */
    public void postFinishedGoodsCompletion(String workOrderNumber, UUID productId, BigDecimal quantity,
                                           BigDecimal totalCost, UUID organizationId) {
        try {
            String url = accountingServiceUrl + "/api/accounting/journal-entries/finished-goods";
            
            BigDecimal unitCost = quantity.compareTo(BigDecimal.ZERO) > 0 
                    ? totalCost.divide(quantity, 2, BigDecimal.ROUND_HALF_UP) 
                    : BigDecimal.ZERO;
            
            Map<String, Object> request = new HashMap<>();
            request.put("organizationId", organizationId);
            request.put("referenceType", "WORK_ORDER_COMPLETION");
            request.put("referenceNumber", workOrderNumber);
            request.put("description", "Finished Goods - WO " + workOrderNumber);
            request.put("entryDate", LocalDateTime.now());
            request.put("productId", productId);
            request.put("quantity", quantity);
            request.put("unitCost", unitCost);
            request.put("totalCost", totalCost);
            
            restTemplate.postForEntity(url, request, Map.class);
            
            log.info("Posted finished goods completion for work order: {}", workOrderNumber);
        } catch (Exception e) {
            log.error("Failed to post finished goods completion: {}", e.getMessage());
        }
    }

    /**
     * Post manufacturing variance (standard cost vs. actual cost)
     */
    public void postManufacturingVariance(String workOrderNumber, BigDecimal standardCost, 
                                         BigDecimal actualCost, UUID organizationId) {
        try {
            BigDecimal variance = actualCost.subtract(standardCost);
            
            if (variance.compareTo(BigDecimal.ZERO) == 0) {
                return; // No variance to post
            }
            
            String url = accountingServiceUrl + "/api/accounting/journal-entries/manufacturing-variance";
            
            Map<String, Object> request = new HashMap<>();
            request.put("organizationId", organizationId);
            request.put("referenceType", "WORK_ORDER_VARIANCE");
            request.put("referenceNumber", workOrderNumber);
            request.put("description", "Manufacturing Variance - WO " + workOrderNumber);
            request.put("entryDate", LocalDateTime.now());
            request.put("standardCost", standardCost);
            request.put("actualCost", actualCost);
            request.put("variance", variance);
            request.put("varianceType", variance.compareTo(BigDecimal.ZERO) > 0 ? "UNFAVORABLE" : "FAVORABLE");
            
            restTemplate.postForEntity(url, request, Map.class);
            
            log.info("Posted manufacturing variance for work order: {} - variance: {}", workOrderNumber, variance);
        } catch (Exception e) {
            log.error("Failed to post manufacturing variance: {}", e.getMessage());
        }
    }

    /**
     * Post scrap cost to GL
     */
    public void postScrapCost(String workOrderNumber, UUID productId, BigDecimal scrapQuantity,
                             BigDecimal scrapCost, UUID organizationId) {
        try {
            String url = accountingServiceUrl + "/api/accounting/journal-entries/scrap";
            
            Map<String, Object> request = new HashMap<>();
            request.put("organizationId", organizationId);
            request.put("referenceType", "WORK_ORDER_SCRAP");
            request.put("referenceNumber", workOrderNumber);
            request.put("description", "Scrap Cost - WO " + workOrderNumber);
            request.put("entryDate", LocalDateTime.now());
            request.put("productId", productId);
            request.put("quantity", scrapQuantity);
            request.put("cost", scrapCost);
            
            restTemplate.postForEntity(url, request, Map.class);
            
            log.info("Posted scrap cost for work order: {}", workOrderNumber);
        } catch (Exception e) {
            log.error("Failed to post scrap cost: {}", e.getMessage());
        }
    }
}


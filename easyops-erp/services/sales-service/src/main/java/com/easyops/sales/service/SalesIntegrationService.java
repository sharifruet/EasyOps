package com.easyops.sales.service;

import com.easyops.sales.client.ARClient;
import com.easyops.sales.entity.Customer;
import com.easyops.sales.entity.SalesOrder;
import com.easyops.sales.entity.SalesOrderLine;
import com.easyops.sales.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesIntegrationService {
    
    private final SalesOrderService salesOrderService;
    private final CustomerRepository customerRepository;
    private final ARClient arClient;
    
    @Transactional
    public UUID convertOrderToInvoice(UUID orderId) {
        log.info("Converting sales order {} to AR invoice", orderId);
        
        SalesOrder order = salesOrderService.getOrderById(orderId);
        
        // Validate order status
        if (!"COMPLETED".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus()) && !"IN_PROGRESS".equals(order.getStatus())) {
            throw new RuntimeException("Can only invoice orders in COMPLETED, CONFIRMED, or IN_PROGRESS status. Current status: " + order.getStatus());
        }
        
        // Check if already invoiced
        if (order.getConvertedToInvoiceId() != null) {
            throw new RuntimeException("Order already invoiced: " + order.getConvertedToInvoiceId());
        }
        
        // Find or sync customer in AR service
        UUID arCustomerId = findOrCreateARCustomer(order.getCustomerId(), order.getOrganizationId());
        
        // Build invoice request
        Map<String, Object> invoiceRequest = new HashMap<>();
        invoiceRequest.put("organizationId", order.getOrganizationId().toString());
        invoiceRequest.put("customerId", arCustomerId.toString());
        invoiceRequest.put("invoiceDate", order.getOrderDate().toString());
        invoiceRequest.put("dueDate", order.getOrderDate().plusDays(30).toString()); // Default 30 days
        invoiceRequest.put("periodId", null); // Will be auto-determined by accounting service
        
        // Build line items
        List<Map<String, Object>> lines = new ArrayList<>();
        for (SalesOrderLine orderLine : order.getLines()) {
            Map<String, Object> line = new HashMap<>();
            line.put("lineNumber", orderLine.getLineNumber());
            line.put("description", orderLine.getProductName() + 
                    (orderLine.getDescription() != null ? " - " + orderLine.getDescription() : ""));
            line.put("quantity", orderLine.getQuantity());
            line.put("unitPrice", orderLine.getUnitPrice());
            line.put("discountPercent", orderLine.getDiscountPercent());
            line.put("taxPercent", orderLine.getTaxPercent());
            line.put("accountId", orderLine.getRevenueAccountId() != null ? 
                    orderLine.getRevenueAccountId().toString() : null);
            
            lines.add(line);
        }
        invoiceRequest.put("lines", lines);
        
        // Add discount if applicable
        if (order.getDiscountPercent() != null && order.getDiscountPercent().compareTo(java.math.BigDecimal.ZERO) > 0) {
            invoiceRequest.put("discountPercent", order.getDiscountPercent());
        }
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
            invoiceRequest.put("discountAmount", order.getDiscountAmount());
        }
        
        // Add notes
        String notes = "Generated from Sales Order: " + order.getOrderNumber();
        if (order.getNotes() != null) {
            notes += "\n" + order.getNotes();
        }
        invoiceRequest.put("notes", notes);
        
        try {
            // Call AR service to create invoice
            Map<String, Object> invoiceResponse = arClient.createInvoice(invoiceRequest);
            UUID invoiceId = UUID.fromString(invoiceResponse.get("id").toString());
            
            log.info("Successfully created AR invoice {} from sales order {}", invoiceId, orderId);
            
            // Update sales order
            salesOrderService.markAsInvoiced(orderId, invoiceId);
            
            return invoiceId;
            
        } catch (Exception e) {
            log.error("Failed to create invoice from sales order {}", orderId, e);
            throw new RuntimeException("Failed to create invoice: " + e.getMessage(), e);
        }
    }
    
    /**
     * Find AR customer ID by matching customer code, or create if not found
     */
    private UUID findOrCreateARCustomer(UUID salesCustomerId, UUID organizationId) {
        // Get the sales customer
        Customer salesCustomer = customerRepository.findById(salesCustomerId)
                .orElseThrow(() -> new RuntimeException("Customer not found in sales: " + salesCustomerId));
        
        try {
            // First, try to get customer from AR service by original ID
            arClient.getCustomer(salesCustomerId);
            log.debug("Customer {} already exists in AR service with same ID", salesCustomerId);
            return salesCustomerId;
        } catch (Exception e) {
            // Not found by ID, try to find by customer code
            log.info("Customer {} not found by ID in AR service, searching by code: {}", 
                    salesCustomerId, salesCustomer.getCustomerCode());
            
            try {
                List<Map<String, Object>> arCustomers = arClient.getCustomers(organizationId);
                
                // Find customer by code
                for (Map<String, Object> arCustomer : arCustomers) {
                    String customerCode = (String) arCustomer.get("customerCode");
                    if (salesCustomer.getCustomerCode().equals(customerCode)) {
                        UUID arCustomerId = UUID.fromString((String) arCustomer.get("id"));
                        log.info("Found existing AR customer {} with code {}", arCustomerId, customerCode);
                        return arCustomerId;
                    }
                }
                
                // Customer not found by code either, create new one
                log.info("Creating new customer in AR service with code {}", salesCustomer.getCustomerCode());
                Map<String, Object> customerRequest = new HashMap<>();
                customerRequest.put("id", salesCustomerId.toString()); // Use same ID
                customerRequest.put("organizationId", organizationId.toString());
                customerRequest.put("customerCode", salesCustomer.getCustomerCode() + "-SALES");
                customerRequest.put("customerName", salesCustomer.getCustomerName());
                customerRequest.put("email", salesCustomer.getEmail());
                customerRequest.put("phone", salesCustomer.getPhone());
                customerRequest.put("creditLimit", salesCustomer.getCreditLimit());
                customerRequest.put("paymentTerms", salesCustomer.getPaymentTerms() != null ? 
                        Integer.parseInt(salesCustomer.getPaymentTerms().replaceAll("\\D+", "")) : 30);
                customerRequest.put("isActive", salesCustomer.getIsActive());
                
                Map<String, Object> createdCustomer = arClient.createCustomer(customerRequest);
                UUID newArCustomerId = UUID.fromString((String) createdCustomer.get("id"));
                log.info("Successfully created customer {} in AR service", newArCustomerId);
                return newArCustomerId;
                
            } catch (Exception findEx) {
                log.error("Failed to find or create customer in AR service", findEx);
                throw new RuntimeException("Cannot create invoice: Customer sync failed - " + findEx.getMessage());
            }
        }
    }
}


package com.easyops.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class StockAdjustmentRequest {
    
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;
    
    @NotNull(message = "Product ID is required")
    private UUID productId;
    
    @NotNull(message = "Warehouse ID is required")
    private UUID warehouseId;
    
    @NotNull(message = "New quantity is required")
    @PositiveOrZero(message = "Quantity must be zero or positive")
    private BigDecimal newQuantity;
    
    @NotNull(message = "Reason is required")
    private String reason;
    
    private String notes;
    private UUID createdBy;
}


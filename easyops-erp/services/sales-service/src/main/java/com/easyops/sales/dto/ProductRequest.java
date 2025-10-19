package com.easyops.sales.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;
    
    @NotNull(message = "Product code is required")
    private String productCode;
    
    @NotNull(message = "Product name is required")
    private String productName;
    
    private String description;
    
    @NotNull(message = "Product type is required")
    private String productType; // GOODS, SERVICE
    
    private String category;
    private String unitOfMeasure;
    
    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice = BigDecimal.ZERO;
    
    private BigDecimal costPrice;
    private BigDecimal taxRate = BigDecimal.ZERO;
    
    private UUID revenueAccountId;
    private UUID cogsAccountId;
    
    private Boolean isActive = true;
    private Boolean trackInventory = false;
}


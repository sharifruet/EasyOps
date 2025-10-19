package com.easyops.sales.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;
    
    @NotNull(message = "Customer code is required")
    private String customerCode;
    
    @NotNull(message = "Customer name is required")
    private String customerName;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    private String contactPerson;
    private String billingAddress;
    private String shippingAddress;
    
    private BigDecimal creditLimit = BigDecimal.ZERO;
    private String paymentTerms;
    private String taxNumber;
    
    private Boolean isActive = true;
}


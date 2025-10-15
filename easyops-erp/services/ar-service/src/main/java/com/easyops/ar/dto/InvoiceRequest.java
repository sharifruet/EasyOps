package com.easyops.ar.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceRequest {
    
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;
    
    @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;
    
    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    @NotNull(message = "Period ID is required")
    private UUID periodId;
    
    private String currency = "USD";
    
    private String notes;
    
    @Valid
    private List<InvoiceLineRequest> lines = new ArrayList<>();
    
    private UUID createdBy;
}


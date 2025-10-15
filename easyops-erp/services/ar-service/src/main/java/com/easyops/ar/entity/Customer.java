package com.easyops.ar.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers", schema = "accounting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "customer_code", nullable = false, length = 50)
    private String customerCode;
    
    @Column(name = "customer_name", nullable = false)
    private String customerName;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone", length = 50)
    private String phone;
    
    @Column(name = "credit_limit", precision = 19, scale = 4)
    private BigDecimal creditLimit = BigDecimal.ZERO;
    
    @Column(name = "payment_terms")
    private Integer paymentTerms = 30;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}


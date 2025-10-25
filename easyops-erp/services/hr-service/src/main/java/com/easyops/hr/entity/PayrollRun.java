package com.easyops.hr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "payroll_runs", schema = "hr")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PayrollRun {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "payroll_run_id")
    private UUID payrollRunId;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "run_name", nullable = false, length = 200)
    private String runName;
    
    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;
    
    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;
    
    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;
    
    @Column(name = "status", length = 50)
    private String status = "draft";
    
    @Column(name = "total_gross_pay", precision = 15, scale = 2)
    private BigDecimal totalGrossPay;
    
    @Column(name = "total_deductions", precision = 15, scale = 2)
    private BigDecimal totalDeductions;
    
    @Column(name = "total_net_pay", precision = 15, scale = 2)
    private BigDecimal totalNetPay;
    
    @Column(name = "employee_count")
    private Integer employeeCount;
    
    @Column(name = "processed_by")
    private UUID processedBy;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "approved_by")
    private UUID approvedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "payrollRunId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollDetail> payrollDetails = new ArrayList<>();
    
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


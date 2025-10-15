package com.easyops.accounting.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "journal_lines", schema = "accounting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JournalLine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "journal_entry_id", nullable = false)
    private UUID journalEntryId;
    
    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;
    
    @Column(name = "account_id", nullable = false)
    private UUID accountId;
    
    @Column(name = "debit_amount", precision = 19, scale = 4)
    private BigDecimal debitAmount = BigDecimal.ZERO;
    
    @Column(name = "credit_amount", precision = 19, scale = 4)
    private BigDecimal creditAmount = BigDecimal.ZERO;
    
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "exchange_rate", precision = 19, scale = 6)
    private BigDecimal exchangeRate = BigDecimal.ONE;
    
    @Column(name = "debit_base", precision = 19, scale = 4)
    private BigDecimal debitBase = BigDecimal.ZERO;
    
    @Column(name = "credit_base", precision = 19, scale = 4)
    private BigDecimal creditBase = BigDecimal.ZERO;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "cost_center_id")
    private UUID costCenterId;
    
    @Column(name = "department_id")
    private UUID departmentId;
    
    @Column(name = "project_id")
    private UUID projectId;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    private Map<String, Object> tags;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        // Calculate base amounts
        if (debitAmount != null && exchangeRate != null) {
            debitBase = debitAmount.multiply(exchangeRate);
        }
        if (creditAmount != null && exchangeRate != null) {
            creditBase = creditAmount.multiply(exchangeRate);
        }
    }
}


package com.easyops.hr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "salary_components", schema = "hr",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "component_name"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SalaryComponent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "component_id")
    private UUID componentId;
    
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;
    
    @Column(name = "component_name", nullable = false, length = 100)
    private String componentName;
    
    @Column(name = "component_type", nullable = false, length = 50)
    private String componentType;
    
    @Column(name = "calculation_type", length = 50)
    private String calculationType = "fixed";
    
    @Column(name = "is_taxable")
    private Boolean isTaxable = true;
    
    @Column(name = "is_statutory")
    private Boolean isStatutory = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
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


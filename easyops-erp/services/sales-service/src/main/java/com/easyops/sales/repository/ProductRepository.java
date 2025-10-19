package com.easyops.sales.repository;

import com.easyops.sales.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    
    List<Product> findByOrganizationId(UUID organizationId);
    
    List<Product> findByOrganizationIdAndIsActiveTrue(UUID organizationId);
    
    List<Product> findByOrganizationIdAndProductType(UUID organizationId, String productType);
    
    List<Product> findByOrganizationIdAndCategory(UUID organizationId, String category);
    
    Optional<Product> findByOrganizationIdAndProductCode(UUID organizationId, String productCode);
    
    boolean existsByOrganizationIdAndProductCode(UUID organizationId, String productCode);
}


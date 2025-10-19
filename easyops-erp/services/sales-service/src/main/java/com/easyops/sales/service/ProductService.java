package com.easyops.sales.service;

import com.easyops.sales.dto.ProductRequest;
import com.easyops.sales.entity.Product;
import com.easyops.sales.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    
    private final ProductRepository productRepository;
    
    @Transactional(readOnly = true)
    public List<Product> getAllProducts(UUID organizationId) {
        return productRepository.findByOrganizationId(organizationId);
    }
    
    @Transactional(readOnly = true)
    public List<Product> getActiveProducts(UUID organizationId) {
        return productRepository.findByOrganizationIdAndIsActiveTrue(organizationId);
    }
    
    @Transactional(readOnly = true)
    public List<Product> getProductsByType(UUID organizationId, String productType) {
        return productRepository.findByOrganizationIdAndProductType(organizationId, productType);
    }
    
    @Transactional(readOnly = true)
    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
    
    @Transactional
    public Product createProduct(ProductRequest request) {
        log.info("Creating product: {} for organization: {}", request.getProductCode(), request.getOrganizationId());
        
        // Check if product code already exists
        if (productRepository.existsByOrganizationIdAndProductCode(request.getOrganizationId(), request.getProductCode())) {
            throw new RuntimeException("Product code already exists: " + request.getProductCode());
        }
        
        Product product = new Product();
        product.setOrganizationId(request.getOrganizationId());
        product.setProductCode(request.getProductCode());
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setCategory(request.getCategory());
        product.setUnitOfMeasure(request.getUnitOfMeasure());
        product.setUnitPrice(request.getUnitPrice());
        product.setCostPrice(request.getCostPrice());
        product.setTaxRate(request.getTaxRate());
        product.setRevenueAccountId(request.getRevenueAccountId());
        product.setCogsAccountId(request.getCogsAccountId());
        product.setIsActive(request.getIsActive());
        product.setTrackInventory(request.getTrackInventory());
        
        return productRepository.save(product);
    }
    
    @Transactional
    public Product updateProduct(UUID id, ProductRequest request) {
        log.info("Updating product: {}", id);
        
        Product product = getProductById(id);
        
        // Check if product code is being changed and if new code already exists
        if (!product.getProductCode().equals(request.getProductCode())) {
            if (productRepository.existsByOrganizationIdAndProductCode(request.getOrganizationId(), request.getProductCode())) {
                throw new RuntimeException("Product code already exists: " + request.getProductCode());
            }
        }
        
        product.setProductCode(request.getProductCode());
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setCategory(request.getCategory());
        product.setUnitOfMeasure(request.getUnitOfMeasure());
        product.setUnitPrice(request.getUnitPrice());
        product.setCostPrice(request.getCostPrice());
        product.setTaxRate(request.getTaxRate());
        product.setRevenueAccountId(request.getRevenueAccountId());
        product.setCogsAccountId(request.getCogsAccountId());
        product.setIsActive(request.getIsActive());
        product.setTrackInventory(request.getTrackInventory());
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(UUID id) {
        log.info("Deleting product: {}", id);
        
        Product product = getProductById(id);
        productRepository.delete(product);
    }
    
    @Transactional
    public Product deactivateProduct(UUID id) {
        log.info("Deactivating product: {}", id);
        
        Product product = getProductById(id);
        product.setIsActive(false);
        
        return productRepository.save(product);
    }
}


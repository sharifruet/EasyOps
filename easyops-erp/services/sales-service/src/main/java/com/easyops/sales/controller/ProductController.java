package com.easyops.sales.controller;

import com.easyops.sales.dto.ProductRequest;
import com.easyops.sales.entity.Product;
import com.easyops.sales.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sales/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Sales Products", description = "Product/Service management for Sales")
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    @Operation(summary = "Get all products for an organization")
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam("organizationId") UUID organizationId,
            @RequestParam(value = "activeOnly", required = false, defaultValue = "false") boolean activeOnly,
            @RequestParam(value = "productType", required = false) String productType) {
        
        log.info("GET /api/sales/products - organizationId: {}, activeOnly: {}, productType: {}", 
                organizationId, activeOnly, productType);
        
        List<Product> products;
        if (productType != null) {
            products = productService.getProductsByType(organizationId, productType);
        } else if (activeOnly) {
            products = productService.getActiveProducts(organizationId);
        } else {
            products = productService.getAllProducts(organizationId);
        }
        
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<Product> getProductById(@PathVariable("id") UUID id) {
        log.info("GET /api/sales/products/{}", id);
        return ResponseEntity.ok(productService.getProductById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create new product")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        log.info("POST /api/sales/products - Creating product for organization: {}", request.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ProductRequest request) {
        log.info("PUT /api/sales/products/{}", id);
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") UUID id) {
        log.info("DELETE /api/sales/products/{}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate product")
    public ResponseEntity<Product> deactivateProduct(@PathVariable("id") UUID id) {
        log.info("POST /api/sales/products/{}/deactivate", id);
        return ResponseEntity.ok(productService.deactivateProduct(id));
    }
}


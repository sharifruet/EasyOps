package com.easyops.inventory.controller;

import com.easyops.inventory.entity.Product;
import com.easyops.inventory.service.ProductService;
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
@RequestMapping("/api/inventory/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Management", description = "Product catalog management APIs")
@CrossOrigin(origins = "*")
public class ProductController {
    
    private final ProductService productService;
    
    @GetMapping
    @Operation(summary = "Get all products")
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam UUID organizationId,
                                                        @RequestParam(required = false) Boolean activeOnly) {
        log.info("GET /api/inventory/products - organizationId: {}, activeOnly: {}", organizationId, activeOnly);
        List<Product> products = productService.getActiveProducts(organizationId, activeOnly);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<Product> getProductById(@PathVariable UUID id) {
        log.info("GET /api/inventory/products/{}", id);
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }
    
    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get product by SKU")
    public ResponseEntity<Product> getProductBySku(@RequestParam UUID organizationId, @PathVariable String sku) {
        log.info("GET /api/inventory/products/sku/{} - org: {}", sku, organizationId);
        Product product = productService.getProductBySku(organizationId, sku);
        return ResponseEntity.ok(product);
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<List<Product>> getProductsByCategory(@RequestParam UUID organizationId, @PathVariable UUID categoryId) {
        log.info("GET /api/inventory/products/category/{} - org: {}", categoryId, organizationId);
        List<Product> products = productService.getProductsByCategory(organizationId, categoryId);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search products by name")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam UUID organizationId, @RequestParam String keyword) {
        log.info("GET /api/inventory/products/search - keyword: {}, org: {}", keyword, organizationId);
        List<Product> products = productService.searchProducts(organizationId, keyword);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping
    @Operation(summary = "Create new product")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        log.info("POST /api/inventory/products - SKU: {}", product.getSku());
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update product")
    public ResponseEntity<Product> updateProduct(@PathVariable UUID id, @Valid @RequestBody Product product) {
        log.info("PUT /api/inventory/products/{}", id);
        Product updatedProduct = productService.updateProduct(id, product);
        return ResponseEntity.ok(updatedProduct);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        log.info("DELETE /api/inventory/products/{}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}


package com.easyops.notification.controller;

import com.easyops.notification.dto.WebhookRequest;
import com.easyops.notification.dto.WebhookResponse;
import com.easyops.notification.entity.WebhookDelivery;
import com.easyops.notification.service.WebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Webhook management")
public class WebhookController {
    
    private final WebhookService webhookService;
    
    @PostMapping
    @Operation(summary = "Create a webhook")
    public ResponseEntity<WebhookResponse> createWebhook(
            @Valid @RequestBody WebhookRequest request,
            @RequestHeader(value = "X-User-Id", required = false) UUID createdBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(webhookService.createWebhook(request, createdBy));
    }
    
    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get organization webhooks")
    public ResponseEntity<List<WebhookResponse>> getOrganizationWebhooks(
            @PathVariable UUID organizationId) {
        return ResponseEntity.ok(webhookService.getOrganizationWebhooks(organizationId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get webhook by ID")
    public ResponseEntity<WebhookResponse> getWebhook(@PathVariable UUID id) {
        return ResponseEntity.ok(webhookService.getWebhook(id));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update webhook")
    public ResponseEntity<WebhookResponse> updateWebhook(
            @PathVariable UUID id,
            @Valid @RequestBody WebhookRequest request) {
        return ResponseEntity.ok(webhookService.updateWebhook(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete webhook")
    public ResponseEntity<Void> deleteWebhook(@PathVariable UUID id) {
        webhookService.deleteWebhook(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/test")
    @Operation(summary = "Test webhook with sample payload")
    public ResponseEntity<String> testWebhook(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload) {
        WebhookResponse webhook = webhookService.getWebhook(id);
        webhookService.triggerWebhooks(webhook.getOrganizationId(), "test.event", payload);
        return ResponseEntity.ok("Webhook test triggered");
    }
    
    @GetMapping("/{id}/deliveries")
    @Operation(summary = "Get webhook delivery history")
    public ResponseEntity<Page<WebhookDelivery>> getDeliveryHistory(
            @PathVariable UUID id,
            Pageable pageable) {
        return ResponseEntity.ok(webhookService.getDeliveryHistory(id, pageable));
    }
}


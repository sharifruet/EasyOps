package com.easyops.ar.controller;

import com.easyops.ar.entity.ReminderConfig;
import com.easyops.ar.entity.ReminderHistory;
import com.easyops.ar.repository.ReminderConfigRepository;
import com.easyops.ar.service.PaymentReminderService;
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
@RequestMapping("/api/ar/reminders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Reminders", description = "Automated payment reminder management")
public class ReminderController {
    
    private final PaymentReminderService reminderService;
    private final ReminderConfigRepository reminderConfigRepository;
    
    @GetMapping("/config")
    @Operation(summary = "Get reminder configuration for an organization")
    public ResponseEntity<ReminderConfig> getReminderConfig(@RequestParam UUID organizationId) {
        log.info("GET /api/ar/reminders/config - organizationId: {}", organizationId);
        
        ReminderConfig config = reminderConfigRepository.findByOrganizationId(organizationId)
                .orElse(createDefaultConfig(organizationId));
        
        return ResponseEntity.ok(config);
    }
    
    @PostMapping("/config")
    @Operation(summary = "Create or update reminder configuration")
    public ResponseEntity<ReminderConfig> saveReminderConfig(@Valid @RequestBody ReminderConfig config) {
        log.info("POST /api/ar/reminders/config - organizationId: {}", config.getOrganizationId());
        
        ReminderConfig savedConfig = reminderConfigRepository.save(config);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedConfig);
    }
    
    @PostMapping("/send-now")
    @Operation(summary = "Manually trigger payment reminders for an organization")
    public ResponseEntity<String> sendRemindersNow(@RequestParam UUID organizationId) {
        log.info("POST /api/ar/reminders/send-now - organizationId: {}", organizationId);
        
        reminderService.sendRemindersNow(organizationId);
        return ResponseEntity.ok("Reminders sent successfully");
    }
    
    @GetMapping("/history")
    @Operation(summary = "Get reminder history")
    public ResponseEntity<List<ReminderHistory>> getReminderHistory(
            @RequestParam UUID organizationId,
            @RequestParam(required = false, defaultValue = "30") Integer days) {
        
        log.info("GET /api/ar/reminders/history - organizationId: {}, days: {}", organizationId, days);
        
        List<ReminderHistory> history = reminderService.getReminderHistory(organizationId, days);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Create default reminder configuration
     */
    private ReminderConfig createDefaultConfig(UUID organizationId) {
        ReminderConfig config = new ReminderConfig();
        config.setOrganizationId(organizationId);
        config.setEnabled(false);
        config.setDaysBeforeDue(-7);
        config.setDaysAfterDueLevel1(1);
        config.setDaysAfterDueLevel2(7);
        config.setDaysAfterDueLevel3(14);
        config.setEmailTemplateBeforeDue("Dear {customerName},\n\nThis is a friendly reminder that invoice {invoiceNumber} for ${totalAmount} will be due on {dueDate}.\n\nThank you for your business!");
        config.setEmailTemplateLevel1("Dear {customerName},\n\nInvoice {invoiceNumber} for ${balanceDue} is now overdue. Please arrange payment at your earliest convenience.\n\nThank you!");
        config.setEmailTemplateLevel2("Dear {customerName},\n\nInvoice {invoiceNumber} for ${balanceDue} is now 7 days overdue. Please contact us to arrange payment.\n\nThank you!");
        config.setEmailTemplateLevel3("Dear {customerName},\n\nUrgent: Invoice {invoiceNumber} for ${balanceDue} is now 14 days overdue. Please contact us immediately.\n\nThank you!");
        return config;
    }
}


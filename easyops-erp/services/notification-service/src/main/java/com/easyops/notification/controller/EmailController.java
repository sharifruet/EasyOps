package com.easyops.notification.controller;

import com.easyops.notification.dto.EmailRequest;
import com.easyops.notification.entity.EmailLog;
import com.easyops.notification.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications/email")
@RequiredArgsConstructor
@Tag(name = "Email", description = "Email notification management")
public class EmailController {
    
    private final EmailService emailService;
    
    @PostMapping("/send")
    @Operation(summary = "Send an email")
    public ResponseEntity<String> sendEmail(@Valid @RequestBody EmailRequest request) {
        emailService.sendEmail(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
            .body("Email queued for delivery");
    }
    
    @GetMapping("/logs/{id}")
    @Operation(summary = "Get email log by ID")
    public ResponseEntity<EmailLog> getEmailLog(@PathVariable UUID id) {
        return ResponseEntity.ok(emailService.getEmailLog(id));
    }
}


package com.easyops.organization.controller;

import com.easyops.organization.dto.SettingRequest;
import com.easyops.organization.service.OrganizationSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Setting Controller
 */
@RestController
@RequestMapping("/api/organizations/{organizationId}/settings")
@RequiredArgsConstructor
@Slf4j
public class SettingController {

    private final OrganizationSettingService settingService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings(@PathVariable UUID organizationId) {
        Map<String, String> settings = settingService.getOrganizationSettings(organizationId);
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/{key}")
    public ResponseEntity<String> getSetting(
            @PathVariable UUID organizationId,
            @PathVariable String key) {
        String value = settingService.getSetting(organizationId, key);
        return value != null ? ResponseEntity.ok(value) : ResponseEntity.notFound().build();
    }

    @PutMapping
    public ResponseEntity<Void> setSetting(
            @PathVariable UUID organizationId,
            @Valid @RequestBody SettingRequest request) {
        settingService.setSetting(
                organizationId,
                request.getKey(),
                request.getValue(),
                request.getType(),
                request.getEncrypted()
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> deleteSetting(
            @PathVariable UUID organizationId,
            @PathVariable String key) {
        settingService.deleteSetting(organizationId, key);
        return ResponseEntity.noContent().build();
    }
}


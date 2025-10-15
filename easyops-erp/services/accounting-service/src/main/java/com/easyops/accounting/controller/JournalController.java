package com.easyops.accounting.controller;

import com.easyops.accounting.dto.JournalEntryRequest;
import com.easyops.accounting.entity.JournalEntry;
import com.easyops.accounting.entity.JournalLine;
import com.easyops.accounting.service.JournalPostingService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/accounting/journals")
@RequiredArgsConstructor
@Tag(name = "Journal Entries", description = "Journal entry posting and management")
public class JournalController {
    
    private final JournalPostingService journalService;
    
    @PostMapping
    @Operation(summary = "Create journal entry (draft)")
    public ResponseEntity<JournalEntry> createJournalEntry(
            @Valid @RequestBody JournalEntryRequest request,
            @RequestHeader(value = "X-User-Id", required = false) UUID createdBy) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(journalService.createJournalEntry(request, createdBy));
    }
    
    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Get journal entries for organization")
    public ResponseEntity<Page<JournalEntry>> getJournalEntries(
            @PathVariable UUID organizationId,
            Pageable pageable) {
        return ResponseEntity.ok(journalService.getJournalEntries(organizationId, pageable));
    }
    
    @GetMapping("/{journalEntryId}")
    @Operation(summary = "Get journal entry by ID")
    public ResponseEntity<JournalEntry> getJournalEntry(@PathVariable UUID journalEntryId) {
        return ResponseEntity.ok(journalService.getJournalEntry(journalEntryId));
    }
    
    @GetMapping("/{journalEntryId}/lines")
    @Operation(summary = "Get journal entry lines")
    public ResponseEntity<List<JournalLine>> getJournalLines(@PathVariable UUID journalEntryId) {
        return ResponseEntity.ok(journalService.getJournalLines(journalEntryId));
    }
    
    @PostMapping("/{journalEntryId}/post")
    @Operation(summary = "Post journal entry to GL")
    public ResponseEntity<JournalEntry> postJournalEntry(
            @PathVariable UUID journalEntryId,
            @RequestHeader(value = "X-User-Id", required = false) UUID postedBy) {
        return ResponseEntity.ok(journalService.postJournalEntry(journalEntryId, postedBy));
    }
    
    @PostMapping("/{journalEntryId}/reverse")
    @Operation(summary = "Reverse a posted journal entry")
    public ResponseEntity<JournalEntry> reverseJournalEntry(
            @PathVariable UUID journalEntryId,
            @RequestHeader(value = "X-User-Id", required = false) UUID reversedBy) {
        return ResponseEntity.ok(journalService.reverseJournalEntry(journalEntryId, reversedBy));
    }
}


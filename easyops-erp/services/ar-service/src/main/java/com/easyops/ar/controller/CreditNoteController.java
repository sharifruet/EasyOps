package com.easyops.ar.controller;

import com.easyops.ar.dto.CreditNoteRequest;
import com.easyops.ar.entity.ARCreditNote;
import com.easyops.ar.service.CreditNoteService;
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
@RequestMapping("/api/ar/credit-notes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AR Credit Notes", description = "Credit note management for Accounts Receivable")
public class CreditNoteController {
    
    private final CreditNoteService creditNoteService;
    
    @GetMapping
    @Operation(summary = "Get all credit notes for an organization")
    public ResponseEntity<List<ARCreditNote>> getAllCreditNotes(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) String status) {
        
        log.info("GET /api/ar/credit-notes - organizationId: {}, status: {}", organizationId, status);
        
        List<ARCreditNote> creditNotes = status != null 
                ? creditNoteService.getCreditNotesByStatus(organizationId, status)
                : creditNoteService.getAllCreditNotes(organizationId);
        
        return ResponseEntity.ok(creditNotes);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get credit note by ID")
    public ResponseEntity<ARCreditNote> getCreditNoteById(@PathVariable UUID id) {
        log.info("GET /api/ar/credit-notes/{}", id);
        ARCreditNote creditNote = creditNoteService.getCreditNoteById(id);
        return ResponseEntity.ok(creditNote);
    }
    
    @PostMapping
    @Operation(summary = "Create new credit note")
    public ResponseEntity<ARCreditNote> createCreditNote(@Valid @RequestBody CreditNoteRequest request) {
        log.info("POST /api/ar/credit-notes - Creating credit note: {}", request.getCreditNoteNumber());
        ARCreditNote creditNote = creditNoteService.createCreditNote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creditNote);
    }
    
    @PostMapping("/{id}/post")
    @Operation(summary = "Post credit note (change status from DRAFT to POSTED)")
    public ResponseEntity<ARCreditNote> postCreditNote(@PathVariable UUID id) {
        log.info("POST /api/ar/credit-notes/{}/post", id);
        ARCreditNote creditNote = creditNoteService.postCreditNote(id);
        return ResponseEntity.ok(creditNote);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete credit note")
    public ResponseEntity<Void> deleteCreditNote(@PathVariable UUID id) {
        log.info("DELETE /api/ar/credit-notes/{}", id);
        creditNoteService.deleteCreditNote(id);
        return ResponseEntity.noContent().build();
    }
}


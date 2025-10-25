package com.easyops.crm.controller;

import com.easyops.crm.entity.Contact;
import com.easyops.crm.service.ContactService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ContactController {
    
    private final ContactService contactService;
    
    @GetMapping
    public ResponseEntity<List<Contact>> getAllContacts(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) String search) {
        
        log.info("GET /api/crm/contacts - organizationId: {}", organizationId);
        
        List<Contact> contacts;
        
        if (search != null && !search.isEmpty()) {
            contacts = contactService.searchContacts(organizationId, search);
        } else if (accountId != null) {
            contacts = contactService.getContactsByAccount(accountId);
        } else {
            contacts = contactService.getAllContacts(organizationId);
        }
        
        return ResponseEntity.ok(contacts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Contact> getContactById(@PathVariable UUID id) {
        log.info("GET /api/crm/contacts/{}", id);
        Contact contact = contactService.getContactById(id);
        return ResponseEntity.ok(contact);
    }
    
    @PostMapping
    public ResponseEntity<Contact> createContact(@RequestBody Contact contact) {
        log.info("POST /api/crm/contacts - Creating contact");
        Contact created = contactService.createContact(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Contact> updateContact(@PathVariable UUID id, @RequestBody Contact contact) {
        log.info("PUT /api/crm/contacts/{}", id);
        Contact updated = contactService.updateContact(id, contact);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        log.info("DELETE /api/crm/contacts/{}", id);
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}



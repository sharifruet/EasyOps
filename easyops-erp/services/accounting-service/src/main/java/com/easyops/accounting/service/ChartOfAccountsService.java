package com.easyops.accounting.service;

import com.easyops.accounting.dto.CoARequest;
import com.easyops.accounting.entity.ChartOfAccounts;
import com.easyops.accounting.repository.ChartOfAccountsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChartOfAccountsService {
    
    private final ChartOfAccountsRepository coaRepository;
    
    @Transactional
    @CacheEvict(value = "coa", key = "#request.organizationId")
    public ChartOfAccounts createAccount(CoARequest request, UUID createdBy) {
        // Validate account code uniqueness
        if (coaRepository.existsByOrganizationIdAndAccountCode(request.getOrganizationId(), request.getAccountCode())) {
            throw new RuntimeException("Account code already exists: " + request.getAccountCode());
        }
        
        // Validate parent account if specified
        if (request.getParentAccountId() != null) {
            ChartOfAccounts parent = coaRepository.findById(request.getParentAccountId())
                .orElseThrow(() -> new RuntimeException("Parent account not found"));
            
            if (!parent.getIsGroup()) {
                throw new RuntimeException("Parent account must be a group account");
            }
        }
        
        ChartOfAccounts account = new ChartOfAccounts();
        account.setOrganizationId(request.getOrganizationId());
        account.setAccountCode(request.getAccountCode());
        account.setAccountName(request.getAccountName());
        account.setParentAccountId(request.getParentAccountId());
        account.setAccountType(request.getAccountType());
        account.setAccountCategory(request.getAccountCategory());
        account.setAccountSubcategory(request.getAccountSubcategory());
        account.setLevel(request.getLevel());
        account.setIsGroup(request.getIsGroup());
        account.setCurrency(request.getCurrency());
        account.setOpeningBalance(request.getOpeningBalance());
        account.setOpeningBalanceDate(request.getOpeningBalanceDate());
        account.setAllowManualEntry(request.getAllowManualEntry());
        account.setDescription(request.getDescription());
        account.setTaxType(request.getTaxType());
        account.setTags(request.getTags());
        account.setCreatedBy(createdBy);
        account.setIsActive(true);
        
        account = coaRepository.save(account);
        log.info("Created account: {} - {}", account.getAccountCode(), account.getAccountName());
        
        return account;
    }
    
    @Cacheable(value = "coa", key = "#organizationId")
    public List<ChartOfAccounts> getOrganizationAccounts(UUID organizationId) {
        return coaRepository.findByOrganizationIdOrderByAccountCode(organizationId);
    }
    
    @Cacheable(value = "coa", key = "'active-' + #organizationId")
    public List<ChartOfAccounts> getActiveAccounts(UUID organizationId) {
        return coaRepository.findByOrganizationIdAndIsActiveOrderByAccountCode(organizationId, true);
    }
    
    public List<ChartOfAccounts> getPostingAccounts(UUID organizationId) {
        return coaRepository.findPostingAccounts(organizationId);
    }
    
    public List<ChartOfAccounts> getAccountsByType(UUID organizationId, String accountType) {
        return coaRepository.findByOrganizationIdAndAccountType(organizationId, accountType);
    }
    
    public ChartOfAccounts getAccountByCode(UUID organizationId, String accountCode) {
        return coaRepository.findByOrganizationIdAndAccountCode(organizationId, accountCode)
            .orElseThrow(() -> new RuntimeException("Account not found: " + accountCode));
    }
    
    public ChartOfAccounts getAccountById(UUID accountId) {
        return coaRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
    }
    
    @Transactional
    @CacheEvict(value = "coa", key = "#account.organizationId")
    public ChartOfAccounts updateAccount(UUID accountId, CoARequest request, UUID updatedBy) {
        ChartOfAccounts account = getAccountById(accountId);
        
        // Don't allow changing account code if transactions exist
        if (!account.getAccountCode().equals(request.getAccountCode())) {
            // TODO: Check if account has transactions
            log.warn("Changing account code from {} to {}", account.getAccountCode(), request.getAccountCode());
        }
        
        account.setAccountName(request.getAccountName());
        account.setAccountCategory(request.getAccountCategory());
        account.setAccountSubcategory(request.getAccountSubcategory());
        account.setDescription(request.getDescription());
        account.setAllowManualEntry(request.getAllowManualEntry());
        account.setTags(request.getTags());
        account.setUpdatedBy(updatedBy);
        
        return coaRepository.save(account);
    }
    
    @Transactional
    @CacheEvict(value = "coa", key = "#organizationId")
    public void deactivateAccount(UUID accountId, UUID organizationId) {
        ChartOfAccounts account = getAccountById(accountId);
        account.setIsActive(false);
        coaRepository.save(account);
        log.info("Deactivated account: {}", account.getAccountCode());
    }
}


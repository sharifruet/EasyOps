package com.easyops.organization.service;

import com.easyops.organization.dto.OrganizationRequest;
import com.easyops.organization.dto.OrganizationResponse;
import com.easyops.organization.entity.Organization;
import com.easyops.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Organization Service
 * Handles business logic for organization management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    /**
     * Create a new organization
     */
    @Transactional
    @CacheEvict(value = "organizations", allEntries = true)
    public OrganizationResponse createOrganization(OrganizationRequest request, UUID createdBy) {
        log.info("Creating organization with code: {}", request.getCode());

        // Check if code already exists
        if (organizationRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Organization code already exists: " + request.getCode());
        }

        Organization organization = Organization.builder()
                .code(request.getCode())
                .name(request.getName())
                .legalName(request.getLegalName())
                .description(request.getDescription())
                .logo(request.getLogo())
                .website(request.getWebsite())
                .email(request.getEmail())
                .phone(request.getPhone())
                .industry(request.getIndustry())
                .businessType(request.getBusinessType())
                .taxId(request.getTaxId())
                .registrationNumber(request.getRegistrationNumber())
                .fiscalYearStart(request.getFiscalYearStart())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .locale(request.getLocale() != null ? request.getLocale() : "en-US")
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .subscriptionPlan(request.getSubscriptionPlan() != null ? request.getSubscriptionPlan() : "FREE")
                .subscriptionStatus("TRIAL")
                .subscriptionStartDate(ZonedDateTime.now())
                .trialEndsAt(ZonedDateTime.now().plusDays(30))
                .maxUsers(request.getMaxUsers() != null ? request.getMaxUsers() : 10)
                .maxStorage(request.getMaxStorage() != null ? request.getMaxStorage() : 1073741824L)
                .status("ACTIVE")
                .isActive(true)
                .createdBy(createdBy)
                .build();

        Organization saved = organizationRepository.save(organization);
        log.info("Organization created successfully: {}", saved.getId());

        return OrganizationResponse.fromEntity(saved);
    }

    /**
     * Get organization by ID
     */
    @Cacheable(value = "organizations", key = "#id")
    public OrganizationResponse getOrganizationById(UUID id) {
        log.debug("Fetching organization by ID: {}", id);
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + id));
        return OrganizationResponse.fromEntity(organization);
    }

    /**
     * Get organization by code
     */
    @Cacheable(value = "organizations", key = "#code")
    public OrganizationResponse getOrganizationByCode(String code) {
        log.debug("Fetching organization by code: {}", code);
        Organization organization = organizationRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + code));
        return OrganizationResponse.fromEntity(organization);
    }

    /**
     * Get all organizations (paginated)
     */
    public Page<OrganizationResponse> getAllOrganizations(Pageable pageable) {
        log.debug("Fetching all organizations");
        return organizationRepository.findAll(pageable)
                .map(OrganizationResponse::fromEntity);
    }

    /**
     * Get organizations by status
     */
    public List<OrganizationResponse> getOrganizationsByStatus(String status) {
        log.debug("Fetching organizations by status: {}", status);
        return organizationRepository.findByStatus(status).stream()
                .map(OrganizationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update organization
     */
    @Transactional
    @CacheEvict(value = "organizations", key = "#id")
    public OrganizationResponse updateOrganization(UUID id, OrganizationRequest request, UUID updatedBy) {
        log.info("Updating organization: {}", id);

        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + id));

        // Update fields
        if (request.getName() != null) organization.setName(request.getName());
        if (request.getLegalName() != null) organization.setLegalName(request.getLegalName());
        if (request.getDescription() != null) organization.setDescription(request.getDescription());
        if (request.getLogo() != null) organization.setLogo(request.getLogo());
        if (request.getWebsite() != null) organization.setWebsite(request.getWebsite());
        if (request.getEmail() != null) organization.setEmail(request.getEmail());
        if (request.getPhone() != null) organization.setPhone(request.getPhone());
        if (request.getIndustry() != null) organization.setIndustry(request.getIndustry());
        if (request.getBusinessType() != null) organization.setBusinessType(request.getBusinessType());
        if (request.getTaxId() != null) organization.setTaxId(request.getTaxId());
        if (request.getRegistrationNumber() != null) organization.setRegistrationNumber(request.getRegistrationNumber());
        if (request.getFiscalYearStart() != null) organization.setFiscalYearStart(request.getFiscalYearStart());
        if (request.getCurrency() != null) organization.setCurrency(request.getCurrency());
        if (request.getTimezone() != null) organization.setTimezone(request.getTimezone());
        if (request.getLocale() != null) organization.setLocale(request.getLocale());
        if (request.getAddressLine1() != null) organization.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) organization.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) organization.setCity(request.getCity());
        if (request.getState() != null) organization.setState(request.getState());
        if (request.getPostalCode() != null) organization.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) organization.setCountry(request.getCountry());

        organization.setUpdatedBy(updatedBy);

        Organization updated = organizationRepository.save(organization);
        log.info("Organization updated successfully: {}", updated.getId());

        return OrganizationResponse.fromEntity(updated);
    }

    /**
     * Delete organization (soft delete)
     */
    @Transactional
    @CacheEvict(value = "organizations", key = "#id")
    public void deleteOrganization(UUID id) {
        log.info("Deleting organization: {}", id);

        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + id));

        organization.setStatus("DELETED");
        organization.setIsActive(false);
        organizationRepository.save(organization);

        log.info("Organization deleted successfully: {}", id);
    }

    /**
     * Activate organization
     */
    @Transactional
    @CacheEvict(value = "organizations", key = "#id")
    public OrganizationResponse activateOrganization(UUID id) {
        log.info("Activating organization: {}", id);

        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + id));

        organization.setStatus("ACTIVE");
        organization.setIsActive(true);
        Organization updated = organizationRepository.save(organization);

        log.info("Organization activated successfully: {}", id);
        return OrganizationResponse.fromEntity(updated);
    }

    /**
     * Suspend organization
     */
    @Transactional
    @CacheEvict(value = "organizations", key = "#id")
    public OrganizationResponse suspendOrganization(UUID id) {
        log.info("Suspending organization: {}", id);

        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + id));

        organization.setStatus("SUSPENDED");
        organization.setIsActive(false);
        Organization updated = organizationRepository.save(organization);

        log.info("Organization suspended successfully: {}", id);
        return OrganizationResponse.fromEntity(updated);
    }

    /**
     * Update subscription plan
     */
    @Transactional
    @CacheEvict(value = "organizations", key = "#id")
    public OrganizationResponse updateSubscriptionPlan(UUID id, String plan, Integer maxUsers, Long maxStorage) {
        log.info("Updating subscription plan for organization: {}", id);

        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + id));

        organization.setSubscriptionPlan(plan);
        if (maxUsers != null) organization.setMaxUsers(maxUsers);
        if (maxStorage != null) organization.setMaxStorage(maxStorage);
        organization.setSubscriptionStatus("ACTIVE");
        if (organization.getSubscriptionStartDate() == null) {
            organization.setSubscriptionStartDate(ZonedDateTime.now());
        }

        Organization updated = organizationRepository.save(organization);
        log.info("Subscription plan updated successfully for organization: {}", id);

        return OrganizationResponse.fromEntity(updated);
    }
}


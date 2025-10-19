package com.easyops.sales.service;

import com.easyops.sales.dto.CustomerRequest;
import com.easyops.sales.entity.Customer;
import com.easyops.sales.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    
    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers(UUID organizationId) {
        return customerRepository.findByOrganizationId(organizationId);
    }
    
    @Transactional(readOnly = true)
    public List<Customer> getActiveCustomers(UUID organizationId) {
        return customerRepository.findByOrganizationIdAndIsActiveTrue(organizationId);
    }
    
    @Transactional(readOnly = true)
    public Customer getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
    
    @Transactional
    public Customer createCustomer(CustomerRequest request) {
        log.info("Creating customer: {} for organization: {}", request.getCustomerCode(), request.getOrganizationId());
        
        // Check if customer code already exists
        if (customerRepository.existsByOrganizationIdAndCustomerCode(request.getOrganizationId(), request.getCustomerCode())) {
            throw new RuntimeException("Customer code already exists: " + request.getCustomerCode());
        }
        
        Customer customer = new Customer();
        customer.setOrganizationId(request.getOrganizationId());
        customer.setCustomerCode(request.getCustomerCode());
        customer.setCustomerName(request.getCustomerName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setContactPerson(request.getContactPerson());
        customer.setBillingAddress(request.getBillingAddress());
        customer.setShippingAddress(request.getShippingAddress());
        customer.setCreditLimit(request.getCreditLimit());
        customer.setPaymentTerms(request.getPaymentTerms());
        customer.setTaxNumber(request.getTaxNumber());
        customer.setIsActive(request.getIsActive());
        
        return customerRepository.save(customer);
    }
    
    @Transactional
    public Customer updateCustomer(UUID id, CustomerRequest request) {
        log.info("Updating customer: {}", id);
        
        Customer customer = getCustomerById(id);
        
        // Check if customer code is being changed and if new code already exists
        if (!customer.getCustomerCode().equals(request.getCustomerCode())) {
            if (customerRepository.existsByOrganizationIdAndCustomerCode(request.getOrganizationId(), request.getCustomerCode())) {
                throw new RuntimeException("Customer code already exists: " + request.getCustomerCode());
            }
        }
        
        customer.setCustomerCode(request.getCustomerCode());
        customer.setCustomerName(request.getCustomerName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setContactPerson(request.getContactPerson());
        customer.setBillingAddress(request.getBillingAddress());
        customer.setShippingAddress(request.getShippingAddress());
        customer.setCreditLimit(request.getCreditLimit());
        customer.setPaymentTerms(request.getPaymentTerms());
        customer.setTaxNumber(request.getTaxNumber());
        customer.setIsActive(request.getIsActive());
        
        return customerRepository.save(customer);
    }
    
    @Transactional
    public void deleteCustomer(UUID id) {
        log.info("Deleting customer: {}", id);
        
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
    
    @Transactional
    public Customer deactivateCustomer(UUID id) {
        log.info("Deactivating customer: {}", id);
        
        Customer customer = getCustomerById(id);
        customer.setIsActive(false);
        
        return customerRepository.save(customer);
    }
}

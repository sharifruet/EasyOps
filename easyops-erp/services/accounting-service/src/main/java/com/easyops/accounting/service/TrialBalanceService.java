package com.easyops.accounting.service;

import com.easyops.accounting.dto.TrialBalanceResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrialBalanceService {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public List<TrialBalanceResponse> getTrialBalance(UUID organizationId, UUID periodId) {
        String sql = """
            SELECT 
                coa.account_code as accountCode,
                coa.account_name as accountName,
                coa.account_type as accountType,
                COALESCE(ab.opening_balance, 0) as openingBalance,
                COALESCE(ab.debit_total, 0) as debitTotal,
                COALESCE(ab.credit_total, 0) as creditTotal,
                COALESCE(ab.closing_balance, 0) as closingBalance
            FROM accounting.chart_of_accounts coa
            LEFT JOIN accounting.account_balances ab ON coa.id = ab.account_id AND ab.period_id = :periodId
            WHERE coa.organization_id = :orgId
            AND coa.is_group = false
            AND coa.is_active = true
            ORDER BY coa.account_code
            """;
        
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(sql)
            .setParameter("orgId", organizationId)
            .setParameter("periodId", periodId)
            .getResultList();
        
        return results.stream()
            .map(row -> new TrialBalanceResponse(
                (String) row[0],  // accountCode
                (String) row[1],  // accountName
                (String) row[2],  // accountType
                (BigDecimal) row[3],  // openingBalance
                (BigDecimal) row[4],  // debitTotal
                (BigDecimal) row[5],  // creditTotal
                (BigDecimal) row[6]   // closingBalance
            ))
            .collect(Collectors.toList());
    }
}


package com.easyops.accounting.service;

import com.easyops.accounting.dto.*;
import com.easyops.accounting.entity.ChartOfAccounts;
import com.easyops.accounting.entity.JournalEntry;
import com.easyops.accounting.entity.JournalLine;
import com.easyops.accounting.entity.Period;
import com.easyops.accounting.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialReportService {
    
    private final JournalLineRepository journalLineRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final ChartOfAccountsRepository coaRepository;
    private final PeriodRepository periodRepository;
    private final AccountBalanceRepository accountBalanceRepository;
    
    /**
     * Generate General Ledger for a specific account
     */
    public List<GeneralLedgerResponse> getGeneralLedger(UUID organizationId, UUID accountId, 
                                                        LocalDate startDate, LocalDate endDate) {
        log.info("Generating general ledger for account: {} from {} to {}", accountId, startDate, endDate);
        
        ChartOfAccounts account = coaRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));
            
        // Get all journal lines for this account within the date range
        List<JournalLine> lines = journalLineRepository.findByAccountIdAndDateRange(accountId, startDate, endDate);
        
        List<GeneralLedgerResponse> ledgerEntries = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;
        
        for (JournalLine line : lines) {
            JournalEntry entry = journalEntryRepository.findById(line.getJournalEntryId())
                .orElse(null);
                
            if (entry == null || !"POSTED".equals(entry.getStatus())) {
                continue; // Skip draft or invalid entries
            }
            
            // Calculate running balance
            BigDecimal debit = line.getDebitAmount() != null ? line.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = line.getCreditAmount() != null ? line.getCreditAmount() : BigDecimal.ZERO;
            
            // For assets and expenses, debit increases balance
            // For liabilities, equity, and revenue, credit increases balance
            if (account.getAccountType().equals("ASSET") || account.getAccountType().equals("EXPENSE")) {
                runningBalance = runningBalance.add(debit).subtract(credit);
            } else {
                runningBalance = runningBalance.add(credit).subtract(debit);
            }
            
            ledgerEntries.add(GeneralLedgerResponse.builder()
                .transactionDate(entry.getJournalDate())
                .journalNumber(entry.getJournalNumber())
                .description(line.getDescription() != null ? line.getDescription() : entry.getDescription())
                .accountCode(account.getAccountCode())
                .accountName(account.getAccountName())
                .debit(debit)
                .credit(credit)
                .runningBalance(runningBalance)
                .journalEntryId(entry.getId())
                .journalLineId(line.getId())
                .status(entry.getStatus())
                .reference(entry.getReferenceNumber())
                .build());
        }
        
        return ledgerEntries;
    }
    
    /**
     * Generate Profit & Loss Statement
     */
    public ProfitLossResponse getProfitAndLoss(UUID organizationId, UUID periodId) {
        log.info("Generating Profit & Loss for organization: {}, period: {}", organizationId, periodId);
        
        Period period = periodRepository.findById(periodId)
            .orElseThrow(() -> new RuntimeException("Period not found"));
        
        // Get all accounts for this organization
        List<ChartOfAccounts> allAccounts = coaRepository.findByOrganizationIdOrderByAccountCode(organizationId);
        
        // Filter accounts by type
        List<ChartOfAccounts> revenueAccounts = allAccounts.stream()
            .filter(a -> "REVENUE".equals(a.getAccountType()) && !a.getIsGroup())
            .collect(Collectors.toList());
            
        List<ChartOfAccounts> expenseAccounts = allAccounts.stream()
            .filter(a -> "EXPENSE".equals(a.getAccountType()) && !a.getIsGroup())
            .collect(Collectors.toList());
        
        // Calculate balances
        List<ProfitLossResponse.AccountLineItem> revenueItems = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        
        for (ChartOfAccounts account : revenueAccounts) {
            BigDecimal balance = calculateAccountBalance(account.getId(), period.getStartDate(), period.getEndDate());
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                revenueItems.add(ProfitLossResponse.AccountLineItem.builder()
                    .accountCode(account.getAccountCode())
                    .accountName(account.getAccountName())
                    .amount(balance)
                    .accountCategory(account.getAccountCategory())
                    .build());
                totalRevenue = totalRevenue.add(balance);
            }
        }
        
        // Separate COGS and Operating Expenses
        List<ProfitLossResponse.AccountLineItem> cogsItems = new ArrayList<>();
        List<ProfitLossResponse.AccountLineItem> opexItems = new ArrayList<>();
        BigDecimal totalCOGS = BigDecimal.ZERO;
        BigDecimal totalOpex = BigDecimal.ZERO;
        
        for (ChartOfAccounts account : expenseAccounts) {
            BigDecimal balance = calculateAccountBalance(account.getId(), period.getStartDate(), period.getEndDate());
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                ProfitLossResponse.AccountLineItem item = ProfitLossResponse.AccountLineItem.builder()
                    .accountCode(account.getAccountCode())
                    .accountName(account.getAccountName())
                    .amount(balance)
                    .accountCategory(account.getAccountCategory())
                    .build();
                    
                if (account.getAccountCategory() != null && 
                    account.getAccountCategory().contains("Cost of")) {
                    cogsItems.add(item);
                    totalCOGS = totalCOGS.add(balance);
                } else {
                    opexItems.add(item);
                    totalOpex = totalOpex.add(balance);
                }
            }
        }
        
        BigDecimal grossProfit = totalRevenue.subtract(totalCOGS);
        BigDecimal operatingIncome = grossProfit.subtract(totalOpex);
        BigDecimal netIncome = operatingIncome;
        
        BigDecimal grossProfitMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0 
            ? grossProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) 
            : BigDecimal.ZERO;
            
        BigDecimal netProfitMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0 
            ? netIncome.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")) 
            : BigDecimal.ZERO;
        
        return ProfitLossResponse.builder()
            .organizationName("Organization") // Could fetch from org service
            .periodName(period.getPeriodName())
            .startDate(period.getStartDate().toString())
            .endDate(period.getEndDate().toString())
            .revenueAccounts(revenueItems)
            .totalRevenue(totalRevenue)
            .cogsAccounts(cogsItems)
            .totalCOGS(totalCOGS)
            .grossProfit(grossProfit)
            .grossProfitMargin(grossProfitMargin)
            .operatingExpenses(opexItems)
            .totalOperatingExpenses(totalOpex)
            .operatingIncome(operatingIncome)
            .netIncome(netIncome)
            .netProfitMargin(netProfitMargin)
            .build();
    }
    
    /**
     * Generate Balance Sheet
     */
    public BalanceSheetResponse getBalanceSheet(UUID organizationId, LocalDate asOfDate) {
        log.info("Generating Balance Sheet for organization: {} as of {}", organizationId, asOfDate);
        
        List<ChartOfAccounts> allAccounts = coaRepository.findByOrganizationIdOrderByAccountCode(organizationId);
        
        // Assets
        List<BalanceSheetResponse.AccountLineItem> currentAssets = new ArrayList<>();
        List<BalanceSheetResponse.AccountLineItem> fixedAssets = new ArrayList<>();
        BigDecimal totalCurrentAssets = BigDecimal.ZERO;
        BigDecimal totalFixedAssets = BigDecimal.ZERO;
        
        for (ChartOfAccounts account : allAccounts) {
            if ("ASSET".equals(account.getAccountType()) && !account.getIsGroup()) {
                BigDecimal balance = calculateAccountBalanceAsOf(account.getId(), asOfDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    BalanceSheetResponse.AccountLineItem item = BalanceSheetResponse.AccountLineItem.builder()
                        .accountCode(account.getAccountCode())
                        .accountName(account.getAccountName())
                        .amount(balance)
                        .accountCategory(account.getAccountCategory())
                        .build();
                        
                    if (account.getAccountCategory() != null && account.getAccountCategory().contains("Current")) {
                        currentAssets.add(item);
                        totalCurrentAssets = totalCurrentAssets.add(balance);
                    } else {
                        fixedAssets.add(item);
                        totalFixedAssets = totalFixedAssets.add(balance);
                    }
                }
            }
        }
        
        // Liabilities
        List<BalanceSheetResponse.AccountLineItem> currentLiabilities = new ArrayList<>();
        List<BalanceSheetResponse.AccountLineItem> longTermLiabilities = new ArrayList<>();
        BigDecimal totalCurrentLiabilities = BigDecimal.ZERO;
        BigDecimal totalLongTermLiabilities = BigDecimal.ZERO;
        
        for (ChartOfAccounts account : allAccounts) {
            if ("LIABILITY".equals(account.getAccountType()) && !account.getIsGroup()) {
                BigDecimal balance = calculateAccountBalanceAsOf(account.getId(), asOfDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    BalanceSheetResponse.AccountLineItem item = BalanceSheetResponse.AccountLineItem.builder()
                        .accountCode(account.getAccountCode())
                        .accountName(account.getAccountName())
                        .amount(balance)
                        .accountCategory(account.getAccountCategory())
                        .build();
                        
                    if (account.getAccountCategory() != null && account.getAccountCategory().contains("Current")) {
                        currentLiabilities.add(item);
                        totalCurrentLiabilities = totalCurrentLiabilities.add(balance);
                    } else {
                        longTermLiabilities.add(item);
                        totalLongTermLiabilities = totalLongTermLiabilities.add(balance);
                    }
                }
            }
        }
        
        // Equity
        List<BalanceSheetResponse.AccountLineItem> equityAccounts = new ArrayList<>();
        BigDecimal totalEquity = BigDecimal.ZERO;
        
        for (ChartOfAccounts account : allAccounts) {
            if ("EQUITY".equals(account.getAccountType()) && !account.getIsGroup()) {
                BigDecimal balance = calculateAccountBalanceAsOf(account.getId(), asOfDate);
                if (balance.compareTo(BigDecimal.ZERO) != 0) {
                    equityAccounts.add(BalanceSheetResponse.AccountLineItem.builder()
                        .accountCode(account.getAccountCode())
                        .accountName(account.getAccountName())
                        .amount(balance)
                        .accountCategory(account.getAccountCategory())
                        .build());
                    totalEquity = totalEquity.add(balance);
                }
            }
        }
        
        BigDecimal totalAssets = totalCurrentAssets.add(totalFixedAssets);
        BigDecimal totalLiabilities = totalCurrentLiabilities.add(totalLongTermLiabilities);
        BigDecimal totalLiabilitiesAndEquity = totalLiabilities.add(totalEquity);
        boolean balanced = totalAssets.compareTo(totalLiabilitiesAndEquity) == 0;
        
        return BalanceSheetResponse.builder()
            .organizationName("Organization")
            .asOfDate(asOfDate.toString())
            .currentAssets(currentAssets)
            .totalCurrentAssets(totalCurrentAssets)
            .fixedAssets(fixedAssets)
            .totalFixedAssets(totalFixedAssets)
            .totalAssets(totalAssets)
            .currentLiabilities(currentLiabilities)
            .totalCurrentLiabilities(totalCurrentLiabilities)
            .longTermLiabilities(longTermLiabilities)
            .totalLongTermLiabilities(totalLongTermLiabilities)
            .totalLiabilities(totalLiabilities)
            .equityAccounts(equityAccounts)
            .totalEquity(totalEquity)
            .totalLiabilitiesAndEquity(totalLiabilitiesAndEquity)
            .balanced(balanced)
            .build();
    }
    
    /**
     * Generate Cash Flow Statement
     */
    public CashFlowResponse getCashFlow(UUID organizationId, UUID periodId) {
        log.info("Generating Cash Flow for organization: {}, period: {}", organizationId, periodId);
        
        Period period = periodRepository.findById(periodId)
            .orElseThrow(() -> new RuntimeException("Period not found"));
        
        // For now, returning a simplified cash flow statement
        // In a full implementation, this would analyze actual cash movements
        
        return CashFlowResponse.builder()
            .organizationName("Organization")
            .periodName(period.getPeriodName())
            .startDate(period.getStartDate().toString())
            .endDate(period.getEndDate().toString())
            .netIncome(BigDecimal.ZERO)
            .operatingAdjustments(new ArrayList<>())
            .netCashFromOperations(BigDecimal.ZERO)
            .investingActivities(new ArrayList<>())
            .netCashFromInvesting(BigDecimal.ZERO)
            .financingActivities(new ArrayList<>())
            .netCashFromFinancing(BigDecimal.ZERO)
            .netCashFlow(BigDecimal.ZERO)
            .cashAtBeginning(BigDecimal.ZERO)
            .cashAtEnd(BigDecimal.ZERO)
            .build();
    }
    
    // Helper method to calculate account balance for a period
    private BigDecimal calculateAccountBalance(UUID accountId, LocalDate startDate, LocalDate endDate) {
        List<JournalLine> lines = journalLineRepository.findByAccountIdAndDateRange(accountId, startDate, endDate);
        
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        
        for (JournalLine line : lines) {
            // Only include posted journal entries
            JournalEntry entry = journalEntryRepository.findById(line.getJournalEntryId()).orElse(null);
            if (entry != null && "POSTED".equals(entry.getStatus())) {
                if (line.getDebitAmount() != null) {
                    totalDebit = totalDebit.add(line.getDebitAmount());
                }
                if (line.getCreditAmount() != null) {
                    totalCredit = totalCredit.add(line.getCreditAmount());
                }
            }
        }
        
        // Return net credit for revenue/liability/equity, net debit for assets/expenses
        return totalCredit.subtract(totalDebit);
    }
    
    // Helper method to calculate account balance as of a specific date
    private BigDecimal calculateAccountBalanceAsOf(UUID accountId, LocalDate asOfDate) {
        // Get account opening balance
        ChartOfAccounts account = coaRepository.findById(accountId).orElse(null);
        BigDecimal balance = (account != null && account.getOpeningBalance() != null) 
            ? account.getOpeningBalance() 
            : BigDecimal.ZERO;
        
        // Add all transactions up to the date
        List<JournalLine> lines = journalLineRepository.findByAccountIdAndDateRange(
            accountId, LocalDate.of(1900, 1, 1), asOfDate);
        
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        
        for (JournalLine line : lines) {
            JournalEntry entry = journalEntryRepository.findById(line.getJournalEntryId()).orElse(null);
            if (entry != null && "POSTED".equals(entry.getStatus())) {
                if (line.getDebitAmount() != null) {
                    totalDebit = totalDebit.add(line.getDebitAmount());
                }
                if (line.getCreditAmount() != null) {
                    totalCredit = totalCredit.add(line.getCreditAmount());
                }
            }
        }
        
        // For assets/expenses: balance = opening + debits - credits
        // For liabilities/equity/revenue: balance = opening + credits - debits
        if (account != null && 
            ("ASSET".equals(account.getAccountType()) || "EXPENSE".equals(account.getAccountType()))) {
            return balance.add(totalDebit).subtract(totalCredit);
        } else {
            return balance.add(totalCredit).subtract(totalDebit);
        }
    }
}


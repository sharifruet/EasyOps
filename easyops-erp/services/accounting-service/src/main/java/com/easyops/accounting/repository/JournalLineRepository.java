package com.easyops.accounting.repository;

import com.easyops.accounting.entity.JournalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface JournalLineRepository extends JpaRepository<JournalLine, UUID> {
    
    List<JournalLine> findByJournalEntryIdOrderByLineNumber(UUID journalEntryId);
    
    List<JournalLine> findByAccountIdOrderByJournalEntryId(UUID accountId);
    
    @Query("SELECT jl FROM JournalLine jl JOIN JournalEntry je ON jl.journalEntryId = je.id WHERE jl.accountId = :accountId AND je.periodId = :periodId ORDER BY je.journalDate")
    List<JournalLine> findByAccountAndPeriod(@Param("accountId") UUID accountId, @Param("periodId") UUID periodId);
    
    @Query("SELECT jl FROM JournalLine jl JOIN JournalEntry je ON jl.journalEntryId = je.id " +
           "WHERE jl.accountId = :accountId AND je.journalDate BETWEEN :startDate AND :endDate " +
           "ORDER BY je.journalDate, je.journalNumber, jl.lineNumber")
    List<JournalLine> findByAccountIdAndDateRange(@Param("accountId") UUID accountId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);
}


package com.easyops.hr.repository;

import com.easyops.hr.entity.ShiftSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShiftScheduleRepository extends JpaRepository<ShiftSchedule, UUID> {
    
    List<ShiftSchedule> findByOrganizationId(UUID organizationId);
    
    List<ShiftSchedule> findByEmployeeIdAndOrganizationId(UUID employeeId, UUID organizationId);
    
    List<ShiftSchedule> findByEmployeeIdAndShiftDate(UUID employeeId, LocalDate shiftDate);
    
    @Query("SELECT ss FROM ShiftSchedule ss WHERE ss.organizationId = :organizationId " +
           "AND ss.shiftDate >= :startDate AND ss.shiftDate <= :endDate " +
           "ORDER BY ss.shiftDate, ss.startTime")
    List<ShiftSchedule> findShiftSchedulesInRange(@Param("organizationId") UUID organizationId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ss FROM ShiftSchedule ss WHERE ss.employeeId = :employeeId " +
           "AND ss.shiftDate >= :startDate AND ss.shiftDate <= :endDate " +
           "ORDER BY ss.shiftDate, ss.startTime")
    List<ShiftSchedule> findEmployeeShiftSchedulesInRange(@Param("employeeId") UUID employeeId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);
}


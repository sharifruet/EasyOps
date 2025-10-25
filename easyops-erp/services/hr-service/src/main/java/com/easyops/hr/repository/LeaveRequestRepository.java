package com.easyops.hr.repository;

import com.easyops.hr.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    
    List<LeaveRequest> findByOrganizationId(UUID organizationId);
    
    List<LeaveRequest> findByEmployeeIdAndOrganizationId(UUID employeeId, UUID organizationId);
    
    List<LeaveRequest> findByOrganizationIdAndStatus(UUID organizationId, String status);
    
    List<LeaveRequest> findByEmployeeIdAndStatus(UUID employeeId, String status);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.organizationId = :organizationId " +
           "AND lr.startDate >= :startDate AND lr.endDate <= :endDate")
    List<LeaveRequest> findLeaveRequestsInRange(@Param("organizationId") UUID organizationId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employeeId = :employeeId " +
           "AND lr.startDate >= :startDate AND lr.endDate <= :endDate")
    List<LeaveRequest> findEmployeeLeaveRequestsInRange(@Param("employeeId") UUID employeeId,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);
}


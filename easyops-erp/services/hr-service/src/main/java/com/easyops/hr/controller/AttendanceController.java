package com.easyops.hr.controller;

import com.easyops.hr.entity.AttendanceRecord;
import com.easyops.hr.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/attendance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllAttendance(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("GET /attendance - organizationId: {}, employeeId: {}", organizationId, employeeId);
        
        List<AttendanceRecord> records;
        
        if (startDate != null && endDate != null) {
            if (employeeId != null) {
                records = attendanceService.getEmployeeAttendanceInRange(employeeId, startDate, endDate);
            } else {
                records = attendanceService.getAttendanceInRange(organizationId, startDate, endDate);
            }
        } else if (employeeId != null) {
            records = attendanceService.getEmployeeAttendance(employeeId, organizationId);
        } else {
            records = attendanceService.getAllAttendance(organizationId);
        }
        
        return ResponseEntity.ok(records);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecord> getAttendanceById(@PathVariable UUID id) {
        log.info("GET /attendance/{}", id);
        AttendanceRecord record = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(record);
    }
    
    @GetMapping("/today")
    public ResponseEntity<List<AttendanceRecord>> getTodayAttendance(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate targetDate = date != null ? date : LocalDate.now();
        log.info("GET /attendance/today - organizationId: {}, date: {}", organizationId, targetDate);
        List<AttendanceRecord> records = attendanceService.getTodayAttendance(organizationId, targetDate);
        return ResponseEntity.ok(records);
    }
    
    @PostMapping("/clock-in")
    public ResponseEntity<AttendanceRecord> clockIn(@RequestBody Map<String, Object> request) {
        UUID employeeId = UUID.fromString((String) request.get("employeeId"));
        UUID organizationId = UUID.fromString((String) request.get("organizationId"));
        String workLocation = (String) request.get("workLocation");
        
        log.info("POST /attendance/clock-in - employeeId: {}", employeeId);
        AttendanceRecord record = attendanceService.clockIn(employeeId, organizationId, workLocation);
        return ResponseEntity.ok(record);
    }
    
    @PostMapping("/clock-out")
    public ResponseEntity<AttendanceRecord> clockOut(@RequestBody Map<String, String> request) {
        UUID employeeId = UUID.fromString(request.get("employeeId"));
        
        log.info("POST /attendance/clock-out - employeeId: {}", employeeId);
        AttendanceRecord record = attendanceService.clockOut(employeeId);
        return ResponseEntity.ok(record);
    }
    
    @PostMapping("/break-start")
    public ResponseEntity<AttendanceRecord> startBreak(@RequestBody Map<String, String> request) {
        UUID employeeId = UUID.fromString(request.get("employeeId"));
        
        log.info("POST /attendance/break-start - employeeId: {}", employeeId);
        AttendanceRecord record = attendanceService.startBreak(employeeId);
        return ResponseEntity.ok(record);
    }
    
    @PostMapping("/break-end")
    public ResponseEntity<AttendanceRecord> endBreak(@RequestBody Map<String, String> request) {
        UUID employeeId = UUID.fromString(request.get("employeeId"));
        
        log.info("POST /attendance/break-end - employeeId: {}", employeeId);
        AttendanceRecord record = attendanceService.endBreak(employeeId);
        return ResponseEntity.ok(record);
    }
    
    @PostMapping
    public ResponseEntity<AttendanceRecord> createAttendance(@RequestBody AttendanceRecord attendance) {
        log.info("POST /attendance - Creating attendance record");
        AttendanceRecord created = attendanceService.createAttendance(attendance);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRecord> updateAttendance(
            @PathVariable UUID id,
            @RequestBody AttendanceRecord attendance) {
        log.info("PUT /attendance/{}", id);
        AttendanceRecord updated = attendanceService.updateAttendance(id, attendance);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable UUID id) {
        log.info("DELETE /attendance/{}", id);
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }
}


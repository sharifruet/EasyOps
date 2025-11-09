package com.easyops.hr.controller;

import com.easyops.hr.dto.DepartmentDto;
import com.easyops.hr.service.DepartmentIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hr/departments")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {

    private final DepartmentIntegrationService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getDepartments(
            @RequestParam UUID organizationId,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) UUID parentDepartmentId) {
        log.debug("Fetching departments for org={}, activeOnly={}, parent={}",
                organizationId, activeOnly, parentDepartmentId);
        List<DepartmentDto> departments = departmentService.getDepartments(organizationId, activeOnly, parentDepartmentId);
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/root")
    public ResponseEntity<List<DepartmentDto>> getRootDepartments(@RequestParam UUID organizationId) {
        log.debug("Fetching root departments for org={}", organizationId);
        List<DepartmentDto> departments = departmentService.getDepartments(organizationId, null, null)
                .stream()
                .filter(dto -> dto.getParentDepartmentId() == null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/{departmentId}")
    public ResponseEntity<DepartmentDto> getDepartmentById(
            @RequestParam UUID organizationId,
            @PathVariable UUID departmentId) {
        log.debug("Fetching department detail org={}, id={}", organizationId, departmentId);
        DepartmentDto department = departmentService.getDepartmentById(organizationId, departmentId);
        return ResponseEntity.ok(department);
    }

    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(
            @RequestParam(required = false) UUID organizationId,
            @RequestBody DepartmentDto department) {
        UUID orgId = organizationId != null ? organizationId : department.getOrganizationId();
        if (orgId == null) {
            return ResponseEntity.badRequest().build();
        }
        department.setOrganizationId(orgId);
        DepartmentDto created = departmentService.createDepartment(orgId, department);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{departmentId}")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable UUID departmentId,
            @RequestBody DepartmentDto department) {
        UUID organizationId = department.getOrganizationId();
        if (organizationId == null) {
            return ResponseEntity.badRequest().build();
        }
        DepartmentDto updated = departmentService.updateDepartment(organizationId, departmentId, department);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{departmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDepartment(
            @RequestParam UUID organizationId,
            @PathVariable UUID departmentId) {
        departmentService.deleteDepartment(organizationId, departmentId);
    }
}


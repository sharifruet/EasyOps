package com.easyops.hr.service;

import com.easyops.hr.dto.DepartmentDto;
import com.easyops.hr.entity.HrDepartment;
import com.easyops.hr.repository.HrDepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentSyncService {

    private final HrDepartmentRepository departmentRepository;

    @Transactional
    public void syncSnapshot(UUID organizationId, List<DepartmentDto> departments) {
        if (departments == null || departments.isEmpty()) {
            log.debug("No departments received for org {}; skipping sync snapshot", organizationId);
            return;
        }

        Map<UUID, HrDepartment> existing = departmentRepository.findByOrganizationId(organizationId)
                .stream()
                .collect(Collectors.toMap(HrDepartment::getDepartmentId, d -> d));

        Set<UUID> incomingIds = departments.stream()
                .map(DepartmentDto::getDepartmentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        departments.stream()
                .filter(dto -> dto.getDepartmentId() != null)
                .forEach(dto -> {
                    UUID deptId = Objects.requireNonNull(dto.getDepartmentId(), "departmentId must not be null");
                    upsert(dto, existing.get(deptId));
                });

        existing.keySet().stream()
                .filter(Objects::nonNull)
                .forEach(idValue -> {
                    UUID id = Objects.requireNonNull(idValue, "departmentId must not be null");
                    if (incomingIds.contains(id)) {
                        return;
                    }
                    departmentRepository.findById(id).ifPresent(entity -> {
                    if (Boolean.TRUE.equals(entity.getIsActive())) {
                        entity.setIsActive(Boolean.FALSE);
                        departmentRepository.save(entity);
                    }
                    });
                });
    }

    @Transactional
    public void upsert(DepartmentDto dto) {
        UUID departmentId = Objects.requireNonNull(dto.getDepartmentId(), "departmentId must not be null");
        upsert(dto, departmentRepository.findById(departmentId).orElse(null));
    }

    @Transactional
    public void delete(UUID departmentId) {
        Objects.requireNonNull(departmentId, "departmentId must not be null");
        departmentRepository.findById(departmentId).ifPresent(departmentRepository::delete);
    }

    private void upsert(DepartmentDto dto, HrDepartment existing) {
        UUID departmentId = Objects.requireNonNull(dto.getDepartmentId(), "departmentId must not be null");
        HrDepartment entity = existing != null ? existing : new HrDepartment();
        entity.setDepartmentId(departmentId);
        entity.setOrganizationId(dto.getOrganizationId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setManagerId(dto.getManagerId());
        entity.setParentDepartmentId(dto.getParentDepartmentId());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : Boolean.TRUE);
        entity.setUpdatedBy("hr-sync");
        if (existing == null) {
            entity.setCreatedBy("hr-sync");
        }
        departmentRepository.save(entity);
    }
}


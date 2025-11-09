package com.easyops.hr.repository;

import com.easyops.hr.entity.HrDepartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HrDepartmentRepository extends JpaRepository<HrDepartment, UUID> {

    List<HrDepartment> findByOrganizationId(UUID organizationId);
}


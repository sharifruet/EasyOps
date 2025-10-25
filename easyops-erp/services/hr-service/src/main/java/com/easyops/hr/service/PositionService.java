package com.easyops.hr.service;

import com.easyops.hr.entity.Position;
import com.easyops.hr.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PositionService {
    
    private final PositionRepository positionRepository;
    
    public List<Position> getAllPositions(UUID organizationId) {
        log.debug("Fetching all positions for organization: {}", organizationId);
        return positionRepository.findByOrganizationId(organizationId);
    }
    
    public List<Position> getActivePositions(UUID organizationId) {
        log.debug("Fetching active positions for organization: {}", organizationId);
        return positionRepository.findByOrganizationIdAndIsActive(organizationId, true);
    }
    
    public List<Position> getPositionsByDepartment(UUID organizationId, UUID departmentId) {
        log.debug("Fetching positions for department: {}", departmentId);
        return positionRepository.findByOrganizationIdAndDepartmentId(organizationId, departmentId);
    }
    
    public Position getPositionById(UUID positionId) {
        log.debug("Fetching position by ID: {}", positionId);
        return positionRepository.findById(positionId)
                .orElseThrow(() -> new RuntimeException("Position not found with ID: " + positionId));
    }
    
    public Position createPosition(Position position) {
        log.info("Creating new position: {} for organization: {}", 
                position.getTitle(), position.getOrganizationId());
        
        // Check for duplicate title
        positionRepository.findByOrganizationIdAndTitle(
                position.getOrganizationId(), position.getTitle())
                .ifPresent(p -> {
                    throw new RuntimeException("Position title already exists: " + position.getTitle());
                });
        
        return positionRepository.save(position);
    }
    
    public Position updatePosition(UUID positionId, Position positionData) {
        log.info("Updating position: {}", positionId);
        
        Position existingPosition = getPositionById(positionId);
        
        // Update fields
        existingPosition.setTitle(positionData.getTitle());
        existingPosition.setDescription(positionData.getDescription());
        existingPosition.setDepartmentId(positionData.getDepartmentId());
        existingPosition.setLevel(positionData.getLevel());
        existingPosition.setSalaryRangeMin(positionData.getSalaryRangeMin());
        existingPosition.setSalaryRangeMax(positionData.getSalaryRangeMax());
        existingPosition.setCurrency(positionData.getCurrency());
        existingPosition.setIsActive(positionData.getIsActive());
        existingPosition.setUpdatedBy(positionData.getUpdatedBy());
        
        return positionRepository.save(existingPosition);
    }
    
    public void deletePosition(UUID positionId) {
        log.info("Deactivating position: {}", positionId);
        Position position = getPositionById(positionId);
        position.setIsActive(false);
        positionRepository.save(position);
    }
}


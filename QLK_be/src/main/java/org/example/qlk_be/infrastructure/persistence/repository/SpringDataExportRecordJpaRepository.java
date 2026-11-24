package org.example.qlk_be.infrastructure.persistence.repository;

import org.example.qlk_be.infrastructure.persistence.entity.ExportRecordJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataExportRecordJpaRepository extends JpaRepository<ExportRecordJpaEntity, Integer> {
    List<ExportRecordJpaEntity> findByProductCode(String productCode);
    List<ExportRecordJpaEntity> findByExportDateBetween(LocalDate startDate, LocalDate endDate);

    @Modifying
    @Transactional
    void deleteByProductCode(String productCode);
}

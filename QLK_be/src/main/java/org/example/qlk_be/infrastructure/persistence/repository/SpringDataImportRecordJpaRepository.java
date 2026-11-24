package org.example.qlk_be.infrastructure.persistence.repository;

import org.example.qlk_be.infrastructure.persistence.entity.ImportRecordJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataImportRecordJpaRepository extends JpaRepository<ImportRecordJpaEntity, Integer> {
    List<ImportRecordJpaEntity> findByProductCode(String productCode);
    List<ImportRecordJpaEntity> findByImportDateBetween(LocalDate startDate, LocalDate endDate);

    @Modifying
    @Transactional
    void deleteByProductCode(String productCode);
}

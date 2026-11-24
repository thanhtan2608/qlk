package org.example.qlk_be.domain.repository;

import org.example.qlk_be.domain.model.ExportRecord;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExportRecordRepository {

    List<ExportRecord> findAll();

    Optional<ExportRecord> findById(Integer id);

    List<ExportRecord> findByProductCode(String productCode);

    List<ExportRecord> findByExportDateBetween(LocalDate startDate, LocalDate endDate);

    ExportRecord save(ExportRecord exportRecord);

    void deleteById(Integer id);

    void deleteByProductCode(String productCode);

    void deleteAll();
}

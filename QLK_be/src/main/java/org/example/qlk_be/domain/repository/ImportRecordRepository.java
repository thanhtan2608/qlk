package org.example.qlk_be.domain.repository;

import org.example.qlk_be.domain.model.ImportRecord;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ImportRecordRepository {

    List<ImportRecord> findAll();

    Optional<ImportRecord> findById(Integer id);

    List<ImportRecord> findByProductCode(String productCode);

    List<ImportRecord> findByImportDateBetween(LocalDate startDate, LocalDate endDate);

    ImportRecord save(ImportRecord importRecord);

    void deleteById(Integer id);

    void deleteByProductCode(String productCode);

    void deleteAll();
}

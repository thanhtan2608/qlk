package org.example.qlk_be.application.usecase;

import org.example.qlk_be.domain.model.ImportRecord;

import java.time.LocalDate;
import java.util.List;

public interface ImportStockUseCase {

    List<ImportRecord> getAllImports();

    ImportRecord getImportById(Integer id);

    List<ImportRecord> getImportsByProductCode(String productCode);

    List<ImportRecord> getImportsByDateRange(LocalDate startDate, LocalDate endDate);

    ImportRecord importStock(String productCode, int quantity, Integer userId);

    void deleteImport(Integer id);

    void deleteImportsByProductCode(String productCode);

    void clearAllImports();
}

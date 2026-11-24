package org.example.qlk_be.application.usecase;

import org.example.qlk_be.domain.model.ExportRecord;

import java.time.LocalDate;
import java.util.List;

public interface ExportStockUseCase {

    List<ExportRecord> getAllExports();

    ExportRecord getExportById(Integer id);

    List<ExportRecord> getExportsByProductCode(String productCode);

    List<ExportRecord> getExportsByDateRange(LocalDate startDate, LocalDate endDate);

    ExportRecord exportStock(String productCode, int quantity, Integer userId);

    void deleteExport(Integer id);

    void deleteExportsByProductCode(String productCode);

    void clearAllExports();
}

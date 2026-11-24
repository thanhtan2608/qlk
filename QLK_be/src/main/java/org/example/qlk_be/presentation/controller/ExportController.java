package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.application.usecase.ExportStockUseCase;
import org.example.qlk_be.presentation.dto.ExportRecordResponse;
import org.example.qlk_be.presentation.dto.StockMovementRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/exports")
@CrossOrigin(origins = "*")
public class ExportController {

    private final ExportStockUseCase exportStockUseCase;

    public ExportController(ExportStockUseCase exportStockUseCase) {
        this.exportStockUseCase = exportStockUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ExportRecordResponse>> getAll(
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var records = (productCode != null && !productCode.isBlank())
                ? exportStockUseCase.getExportsByProductCode(productCode.trim())
                : ((startDate != null || endDate != null)
                ? exportStockUseCase.getExportsByDateRange(startDate, endDate)
                : exportStockUseCase.getAllExports());
        return ResponseEntity.ok(records.stream().map(ExportRecordResponse::fromDomain).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExportRecordResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ExportRecordResponse.fromDomain(exportStockUseCase.getExportById(id)));
    }

    @PostMapping
    public ResponseEntity<ExportRecordResponse> create(@RequestBody StockMovementRequest request) {
        var created = exportStockUseCase.exportStock(
                request.getProductCode(),
                request.getQuantity(),
                request.getUserId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ExportRecordResponse.fromDomain(created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        exportStockUseCase.deleteExport(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/product/{productCode}")
    public ResponseEntity<Void> deleteByProductCode(@PathVariable String productCode) {
        exportStockUseCase.deleteExportsByProductCode(productCode);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearAll() {
        exportStockUseCase.clearAllExports();
        return ResponseEntity.noContent().build();
    }
}

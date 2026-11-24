package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.application.usecase.ImportStockUseCase;
import org.example.qlk_be.presentation.dto.ImportRecordResponse;
import org.example.qlk_be.presentation.dto.StockMovementRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/imports")
@CrossOrigin(origins = "*")
public class ImportController {

    private final ImportStockUseCase importStockUseCase;

    public ImportController(ImportStockUseCase importStockUseCase) {
        this.importStockUseCase = importStockUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ImportRecordResponse>> getAll(
            @RequestParam(required = false) String productCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var records = (productCode != null && !productCode.isBlank())
                ? importStockUseCase.getImportsByProductCode(productCode.trim())
                : ((startDate != null || endDate != null)
                ? importStockUseCase.getImportsByDateRange(startDate, endDate)
                : importStockUseCase.getAllImports());
        return ResponseEntity.ok(records.stream().map(ImportRecordResponse::fromDomain).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImportRecordResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ImportRecordResponse.fromDomain(importStockUseCase.getImportById(id)));
    }

    @PostMapping
    public ResponseEntity<ImportRecordResponse> create(@RequestBody StockMovementRequest request) {
        var created = importStockUseCase.importStock(
                request.getProductCode(),
                request.getQuantity(),
                request.getUserId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ImportRecordResponse.fromDomain(created));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        importStockUseCase.deleteImport(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/product/{productCode}")
    public ResponseEntity<Void> deleteByProductCode(@PathVariable String productCode) {
        importStockUseCase.deleteImportsByProductCode(productCode);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearAll() {
        importStockUseCase.clearAllImports();
        return ResponseEntity.noContent().build();
    }
}

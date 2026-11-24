package org.example.qlk_be.presentation.dto;

import org.example.qlk_be.domain.model.ImportRecord;
import java.time.LocalDate;
import java.time.LocalTime;

public class ImportRecordResponse {
    private Integer id;
    private String productCode;
    private String name;
    private int quantity;
    private LocalDate importDate;
    private LocalTime importTime;
    private Integer userId;

    public static ImportRecordResponse fromDomain(ImportRecord r) {
        ImportRecordResponse res = new ImportRecordResponse();
        res.id = r.getId();
        res.productCode = r.getProductCode();
        res.name = r.getName();
        res.quantity = r.getQuantity();
        res.importDate = r.getImportDate();
        res.importTime = r.getImportTime();
        res.userId = r.getUserId();
        return res;
    }

    public Integer getId() { return id; }
    public String getProductCode() { return productCode; }
    public String getName() { return name; }
    public int getQuantity() { return quantity; }
    public LocalDate getImportDate() { return importDate; }
    public LocalTime getImportTime() { return importTime; }
    public Integer getUserId() { return userId; }
}
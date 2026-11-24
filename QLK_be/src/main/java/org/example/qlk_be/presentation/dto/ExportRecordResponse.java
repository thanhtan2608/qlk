package org.example.qlk_be.presentation.dto;

import org.example.qlk_be.domain.model.ExportRecord;
import java.time.LocalDate;
import java.time.LocalTime;

public class ExportRecordResponse {
    private Integer id;
    private String productCode;
    private String name;
    private int quantity;
    private LocalDate exportDate;
    private LocalTime exportTime;
    private Integer userId;

    public static ExportRecordResponse fromDomain(ExportRecord r) {
        ExportRecordResponse res = new ExportRecordResponse();
        res.id = r.getId();
        res.productCode = r.getProductCode();
        res.name = r.getName();
        res.quantity = r.getQuantity();
        res.exportDate = r.getExportDate();
        res.exportTime = r.getExportTime();
        res.userId = r.getUserId();
        return res;
    }

    public Integer getId() { return id; }
    public String getProductCode() { return productCode; }
    public String getName() { return name; }
    public int getQuantity() { return quantity; }
    public LocalDate getExportDate() { return exportDate; }
    public LocalTime getExportTime() { return exportTime; }
    public Integer getUserId() { return userId; }
}
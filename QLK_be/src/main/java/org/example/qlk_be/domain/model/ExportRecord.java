package org.example.qlk_be.domain.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

public class ExportRecord {

    private static final ZoneId SYSTEM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private Integer id;
    private String productCode;
    private String name;
    private int quantity;
    private LocalDate exportDate;
    private LocalTime exportTime;
    private Integer userId;

    public ExportRecord() {
        this.exportDate = LocalDate.now(SYSTEM_ZONE);
        this.exportTime = LocalTime.now(SYSTEM_ZONE).withNano(0);
    }

    public ExportRecord(Integer id, String productCode, String name, int quantity,
                        LocalDate exportDate, LocalTime exportTime, Integer userId) {
        this.id = id;
        this.productCode = productCode;
        this.name = name;
        setQuantity(quantity);
        this.exportDate = exportDate != null ? exportDate : LocalDate.now(SYSTEM_ZONE);
        this.exportTime = exportTime != null ? exportTime.withNano(0) : LocalTime.now(SYSTEM_ZONE).withNano(0);
        this.userId = userId;
    }

    // Constructor tạo phiếu mới: tự động lấy ngày giờ hệ thống
    public ExportRecord(String productCode, String name, int quantity, Integer userId) {
        this.productCode = productCode;
        this.name = name;
        setQuantity(quantity);
        this.exportDate = LocalDate.now(SYSTEM_ZONE);
        this.exportTime = LocalTime.now(SYSTEM_ZONE).withNano(0);
        this.userId = userId;
    }

    // Gọi khi muốn làm mới lại ngày giờ theo thời điểm hệ thống hiện tại
    public void stampCurrentDateTime() {
        this.exportDate = LocalDate.now(SYSTEM_ZONE);
        this.exportTime = LocalTime.now(SYSTEM_ZONE).withNano(0);
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng xuất phải lớn hơn 0");
        }
        this.quantity = quantity;
    }

    public LocalDate getExportDate() {
        return exportDate;
    }

    public void setExportDate(LocalDate exportDate) {
        this.exportDate = exportDate;
    }

    public LocalTime getExportTime() {
        return exportTime;
    }

    public void setExportTime(LocalTime exportTime) {
        this.exportTime = exportTime != null ? exportTime.withNano(0) : null;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
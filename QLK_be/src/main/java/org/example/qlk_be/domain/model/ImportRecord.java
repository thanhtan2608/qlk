package org.example.qlk_be.domain.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

public class ImportRecord {

    private static final ZoneId SYSTEM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private Integer id;
    private String productCode;
    private String name;
    private int quantity;
    private LocalDate importDate;
    private LocalTime importTime;
    private Integer userId;

    public ImportRecord() {
        this.importDate = LocalDate.now(SYSTEM_ZONE);
        this.importTime = LocalTime.now(SYSTEM_ZONE).withNano(0);
    }

    public ImportRecord(Integer id, String productCode, String name, int quantity,
                        LocalDate importDate, LocalTime importTime, Integer userId) {
        this.id = id;
        this.productCode = productCode;
        this.name = name;
        setQuantity(quantity);
        this.importDate = importDate != null ? importDate : LocalDate.now(SYSTEM_ZONE);
        this.importTime = importTime != null ? importTime.withNano(0) : LocalTime.now(SYSTEM_ZONE).withNano(0);
        this.userId = userId;
    }

    // Constructor tạo phiếu mới: tự động lấy ngày giờ hệ thống
    public ImportRecord(String productCode, String name, int quantity, Integer userId) {
        this.productCode = productCode;
        this.name = name;
        setQuantity(quantity);
        this.importDate = LocalDate.now(SYSTEM_ZONE);
        this.importTime = LocalTime.now(SYSTEM_ZONE).withNano(0);
        this.userId = userId;
    }

    // Gọi khi muốn làm mới lại ngày giờ theo thời điểm hệ thống hiện tại
    public void stampCurrentDateTime() {
        this.importDate = LocalDate.now(SYSTEM_ZONE);
        this.importTime = LocalTime.now(SYSTEM_ZONE).withNano(0);
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
            throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
        }
        this.quantity = quantity;
    }

    public LocalDate getImportDate() {
        return importDate;
    }

    public void setImportDate(LocalDate importDate) {
        this.importDate = importDate;
    }

    public LocalTime getImportTime() {
        return importTime;
    }

    public void setImportTime(LocalTime importTime) {
        this.importTime = importTime != null ? importTime.withNano(0) : null;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}
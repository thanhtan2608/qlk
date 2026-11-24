package org.example.qlk_be.domain.model;

import java.time.LocalDateTime;
import java.time.ZoneId;

public class Product {

    private static final ZoneId SYSTEM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private Integer id;
    private String productCode;
    private String name;
    private Integer categoryId;
    private int quantity;
    private LocalDateTime updatedAt;

    public Product() {
        this.updatedAt = currentSystemDateTime();
    }

    public Product(Integer id, String productCode, String name, Integer categoryId, int quantity, LocalDateTime updatedAt) {
        this.id = id;
        this.productCode = productCode;
        this.name = name;
        this.categoryId = categoryId;
        setQuantity(quantity);
        this.updatedAt = updatedAt != null ? updatedAt.withNano(0) : currentSystemDateTime();
    }

    public Product(String productCode, String name, Integer categoryId, int quantity) {
        this.productCode = productCode;
        this.name = name;
        this.categoryId = categoryId;
        setQuantity(quantity);
        this.updatedAt = currentSystemDateTime();
    }

    private static LocalDateTime currentSystemDateTime() {
        return LocalDateTime.now(SYSTEM_ZONE).withNano(0);
    }

    public void touchUpdatedAt() {
        this.updatedAt = currentSystemDateTime();
    }

    public void increaseStock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
        }
        this.quantity += amount;
        this.updatedAt = currentSystemDateTime();
    }

    public void decreaseStock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Số lượng xuất phải lớn hơn 0");
        }
        if (this.quantity < amount) {
            throw new IllegalStateException(
                    "Số lượng tồn kho không đủ (Hiện còn: " + this.quantity + ", yêu cầu xuất: " + amount + ")"
            );
        }
        this.quantity -= amount;
        this.updatedAt = currentSystemDateTime();
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

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        if (quantity < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được nhỏ hơn 0");
        }
        this.quantity = quantity;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt != null ? updatedAt.withNano(0) : null;
    }
}
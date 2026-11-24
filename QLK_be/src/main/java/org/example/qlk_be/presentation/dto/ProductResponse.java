package org.example.qlk_be.presentation.dto;

import org.example.qlk_be.domain.model.Product;
import java.time.LocalDateTime;

public class ProductResponse {
    private Integer id;
    private String productCode;
    private String name;
    private Integer categoryId;
    private int quantity;
    private LocalDateTime updatedAt;

    public static ProductResponse fromDomain(Product p) {
        ProductResponse res = new ProductResponse();
        res.id = p.getId();
        res.productCode = p.getProductCode();
        res.name = p.getName();
        res.categoryId = p.getCategoryId();
        res.quantity = p.getQuantity();
        res.updatedAt = p.getUpdatedAt();
        return res;
    }

    public Integer getId() { return id; }
    public String getProductCode() { return productCode; }
    public String getName() { return name; }
    public Integer getCategoryId() { return categoryId; }
    public int getQuantity() { return quantity; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

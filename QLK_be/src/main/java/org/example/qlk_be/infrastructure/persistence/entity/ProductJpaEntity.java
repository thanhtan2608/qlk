package org.example.qlk_be.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.qlk_be.domain.model.Product;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class ProductJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_code", nullable = false, unique = true, length = 100)
    private String productCode;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public static ProductJpaEntity fromDomain(Product product) {
        if (product == null) {
            return null;
        }
        ProductJpaEntity entity = new ProductJpaEntity();
        entity.setId(product.getId());
        entity.setProductCode(product.getProductCode());
        entity.setName(product.getName());
        entity.setCategoryId(product.getCategoryId());
        entity.setQuantity(product.getQuantity());
        entity.setUpdatedAt(product.getUpdatedAt() != null ? product.getUpdatedAt().withNano(0) : null);
        return entity;
    }

    public Product toDomain() {
        return new Product(
                this.id,
                this.productCode,
                this.name,
                this.categoryId,
                this.quantity,
                this.updatedAt != null ? this.updatedAt.withNano(0) : null
        );
    }
}
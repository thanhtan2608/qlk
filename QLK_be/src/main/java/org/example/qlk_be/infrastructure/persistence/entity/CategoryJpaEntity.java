package org.example.qlk_be.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.qlk_be.domain.model.Category;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class CategoryJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "category_name", nullable = false, unique = true, length = 150)
    private String categoryName;

    @Column(name = "description", length = 500)
    private String description;

    public static CategoryJpaEntity fromDomain(Category category) {
        if (category == null) {
            return null;
        }
        CategoryJpaEntity entity = new CategoryJpaEntity();
        entity.setId(category.getId());
        entity.setCategoryName(category.getCategoryName());
        entity.setDescription(category.getDescription());
        return entity;
    }

    public Category toDomain() {
        return new Category(this.id, this.categoryName, this.description);
    }
}
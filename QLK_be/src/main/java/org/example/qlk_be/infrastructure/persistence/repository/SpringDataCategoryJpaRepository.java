package org.example.qlk_be.infrastructure.persistence.repository;

import org.example.qlk_be.infrastructure.persistence.entity.CategoryJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataCategoryJpaRepository extends JpaRepository<CategoryJpaEntity, Integer> {
    Optional<CategoryJpaEntity> findByCategoryName(String categoryName);
    List<CategoryJpaEntity> findByCategoryNameContainingIgnoreCase(String keyword);
    boolean existsByCategoryName(String categoryName);
}
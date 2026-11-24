package org.example.qlk_be.infrastructure.persistence.repository;

import org.example.qlk_be.infrastructure.persistence.entity.ProductJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataProductJpaRepository extends JpaRepository<ProductJpaEntity, Integer> {
    Optional<ProductJpaEntity> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);
    List<ProductJpaEntity> findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(String name, String productCode);
    List<ProductJpaEntity> findByCategoryId(Integer categoryId);
}
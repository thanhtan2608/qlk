package org.example.qlk_be.infrastructure.persistence.adapter;

import org.example.qlk_be.domain.model.Product;
import org.example.qlk_be.domain.repository.ProductRepository;
import org.example.qlk_be.infrastructure.persistence.entity.ProductJpaEntity;
import org.example.qlk_be.infrastructure.persistence.repository.SpringDataProductJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductRepositoryImpl implements ProductRepository {

    private final SpringDataProductJpaRepository jpaRepository;

    public ProductRepositoryImpl(SpringDataProductJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Product> findAll() {
        return jpaRepository.findAll().stream().map(ProductJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<Product> findById(Integer id) {
        return jpaRepository.findById(id).map(ProductJpaEntity::toDomain);
    }

    @Override
    public Optional<Product> findByProductCode(String productCode) {
        return jpaRepository.findByProductCode(productCode).map(ProductJpaEntity::toDomain);
    }

    @Override
    public boolean existsByProductCode(String productCode) {
        return jpaRepository.existsByProductCode(productCode);
    }

    @Override
    public List<Product> searchByNameOrCode(String keyword) {
        return jpaRepository.findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(ProductJpaEntity::toDomain)
                .toList();
    }

    @Override
    public List<Product> findByCategoryId(Integer categoryId) {
        return jpaRepository.findByCategoryId(categoryId).stream().map(ProductJpaEntity::toDomain).toList();
    }

    @Override
    public Product save(Product product) {
        return jpaRepository.save(ProductJpaEntity.fromDomain(product)).toDomain();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }
}

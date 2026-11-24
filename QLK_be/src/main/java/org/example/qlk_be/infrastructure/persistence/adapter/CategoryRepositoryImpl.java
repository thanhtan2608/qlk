package org.example.qlk_be.infrastructure.persistence.adapter;

import org.example.qlk_be.domain.model.Category;
import org.example.qlk_be.domain.repository.CategoryRepository;
import org.example.qlk_be.infrastructure.persistence.entity.CategoryJpaEntity;
import org.example.qlk_be.infrastructure.persistence.repository.SpringDataCategoryJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CategoryRepositoryImpl implements CategoryRepository {

    private final SpringDataCategoryJpaRepository jpaRepository;

    public CategoryRepositoryImpl(SpringDataCategoryJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<Category> findAll() {
        return jpaRepository.findAll().stream().map(CategoryJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<Category> findById(Integer id) {
        return jpaRepository.findById(id).map(CategoryJpaEntity::toDomain);
    }

    @Override
    public Optional<Category> findByCategoryName(String categoryName) {
        return jpaRepository.findByCategoryName(categoryName).map(CategoryJpaEntity::toDomain);
    }

    @Override
    public List<Category> searchByName(String keyword) {
        return jpaRepository.findByCategoryNameContainingIgnoreCase(keyword)
                .stream()
                .map(CategoryJpaEntity::toDomain)
                .toList();
    }

    @Override
    public boolean existsByCategoryName(String categoryName) {
        return jpaRepository.existsByCategoryName(categoryName);
    }

    @Override
    public Category save(Category category) {
        return jpaRepository.save(CategoryJpaEntity.fromDomain(category)).toDomain();
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
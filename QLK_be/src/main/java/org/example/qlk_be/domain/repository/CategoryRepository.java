package org.example.qlk_be.domain.repository;

import org.example.qlk_be.domain.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository {

    List<Category> findAll();

    Optional<Category> findById(Integer id);

    Optional<Category> findByCategoryName(String categoryName);

    List<Category> searchByName(String keyword);

    boolean existsByCategoryName(String categoryName);

    Category save(Category category);

    void deleteById(Integer id);

    void deleteAll();
}
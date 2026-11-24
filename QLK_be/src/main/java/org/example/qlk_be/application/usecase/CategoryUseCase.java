package org.example.qlk_be.application.usecase;

import org.example.qlk_be.domain.model.Category;

import java.util.List;

public interface CategoryUseCase {

    List<Category> getAllCategories();

    Category getCategoryById(Integer id);

    List<Category> searchCategoriesByName(String keyword);

    Category createCategory(String categoryName, String description);

    Category updateCategory(Integer id, String categoryName, String description);

    void deleteCategory(Integer id);

    void deleteAllCategories();
}
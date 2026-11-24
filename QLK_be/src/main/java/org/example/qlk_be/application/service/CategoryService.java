package org.example.qlk_be.application.service;

import org.example.qlk_be.application.usecase.CategoryUseCase;
import org.example.qlk_be.domain.exception.DuplicateResourceException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.example.qlk_be.domain.model.Category;
import org.example.qlk_be.domain.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService implements CategoryUseCase {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));
    }

    @Override
    public List<Category> searchCategoriesByName(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return categoryRepository.findAll();
        }
        return categoryRepository.searchByName(keyword.trim());
    }

    @Override
    @Transactional
    public Category createCategory(String categoryName, String description) {
        String normalizedName = validateAndNormalizeName(categoryName);
        if (categoryRepository.existsByCategoryName(normalizedName)) {
            throw new DuplicateResourceException("Danh mục", "categoryName", normalizedName);
        }
        Category category = new Category(normalizedName, description);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(Integer id, String categoryName, String description) {
        Category existing = getCategoryById(id);
        String normalizedName = validateAndNormalizeName(categoryName);

        categoryRepository.findByCategoryName(normalizedName)
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> {
                    throw new DuplicateResourceException("Danh mục", "categoryName", normalizedName);
                });

        existing.setCategoryName(normalizedName);
        existing.setDescription(description);
        return categoryRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        Category existing = getCategoryById(id);
        categoryRepository.deleteById(existing.getId());
    }

    @Override
    @Transactional
    public void deleteAllCategories() {
        categoryRepository.deleteAll();
    }

    private String validateAndNormalizeName(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên danh mục không được để trống");
        }
        return categoryName.trim();
    }
}
package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.application.usecase.CategoryUseCase;
import org.example.qlk_be.presentation.dto.CategoryRequest;
import org.example.qlk_be.presentation.dto.CategoryResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryUseCase categoryUseCase;

    public CategoryController(CategoryUseCase categoryUseCase) {
        this.categoryUseCase = categoryUseCase;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(@RequestParam(required = false) String keyword) {
        var list = (keyword != null && !keyword.isBlank())
                ? categoryUseCase.searchCategoriesByName(keyword)
                : categoryUseCase.getAllCategories();
        return ResponseEntity.ok(list.stream().map(CategoryResponse::fromDomain).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(CategoryResponse.fromDomain(categoryUseCase.getCategoryById(id)));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@RequestBody CategoryRequest request) {
        var created = categoryUseCase.createCategory(request.getCategoryName(), request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(CategoryResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable Integer id, @RequestBody CategoryRequest request) {
        var updated = categoryUseCase.updateCategory(id, request.getCategoryName(), request.getDescription());
        return ResponseEntity.ok(CategoryResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        categoryUseCase.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll() {
        categoryUseCase.deleteAllCategories();
        return ResponseEntity.noContent().build();
    }
}
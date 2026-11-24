package org.example.qlk_be.presentation.dto;

import org.example.qlk_be.domain.model.Category;

public class CategoryResponse {
    private Integer id;
    private String categoryName;
    private String description;

    public static CategoryResponse fromDomain(Category c) {
        CategoryResponse res = new CategoryResponse();
        res.id = c.getId();
        res.categoryName = c.getCategoryName();
        res.description = c.getDescription();
        return res;
    }

    public Integer getId() { return id; }
    public String getCategoryName() { return categoryName; }
    public String getDescription() { return description; }
}
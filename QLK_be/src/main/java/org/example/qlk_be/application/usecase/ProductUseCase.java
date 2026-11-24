package org.example.qlk_be.application.usecase;

import org.example.qlk_be.domain.model.Product;

import java.util.List;

public interface ProductUseCase {

    List<Product> getAllProducts();

    Product getProductById(Integer id);

    Product getProductByCode(String productCode);

    List<Product> searchProducts(String keyword);

    List<Product> getProductsByCategory(Integer categoryId);

    Product createProduct(String productCode, String name, Integer categoryId, int initialQuantity);

    Product updateProduct(Integer id, String productCode, String name, Integer categoryId);

    void deleteProduct(Integer id);

    void deleteAllProducts();
}

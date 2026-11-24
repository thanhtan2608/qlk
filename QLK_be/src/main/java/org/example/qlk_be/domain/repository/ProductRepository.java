package org.example.qlk_be.domain.repository;

import org.example.qlk_be.domain.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository {

    List<Product> findAll();

    Optional<Product> findById(Integer id);

    Optional<Product> findByProductCode(String productCode);

    boolean existsByProductCode(String productCode);

    List<Product> searchByNameOrCode(String keyword);

    List<Product> findByCategoryId(Integer categoryId);

    Product save(Product product);

    void deleteById(Integer id);

    void deleteAll();
}

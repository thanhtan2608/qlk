package org.example.qlk_be.application.service;

import org.example.qlk_be.application.usecase.ProductUseCase;
import org.example.qlk_be.domain.exception.DuplicateResourceException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.example.qlk_be.domain.model.Product;
import org.example.qlk_be.domain.repository.CategoryRepository;
import org.example.qlk_be.domain.repository.ExportRecordRepository;
import org.example.qlk_be.domain.repository.ImportRecordRepository;
import org.example.qlk_be.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService implements ProductUseCase {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ImportRecordRepository importRecordRepository;
    private final ExportRecordRepository exportRecordRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ImportRecordRepository importRecordRepository,
                          ExportRecordRepository exportRecordRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.importRecordRepository = importRecordRepository;
        this.exportRecordRepository = exportRecordRepository;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
    }

    @Override
    public Product getProductByCode(String productCode) {
        String normalizedCode = validateAndNormalizeCode(productCode);
        return productRepository.findByProductCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "productCode", normalizedCode));
    }

    @Override
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.searchByNameOrCode(keyword.trim());
    }

    @Override
    public List<Product> getProductsByCategory(Integer categoryId) {
        ensureCategoryExists(categoryId);
        return productRepository.findByCategoryId(categoryId);
    }

    @Override
    @Transactional
    public Product createProduct(String productCode, String name, Integer categoryId, int initialQuantity) {
        String normalizedCode = validateAndNormalizeCode(productCode);
        String normalizedName = validateAndNormalizeName(name);
        ensureCategoryExists(categoryId);

        if (productRepository.existsByProductCode(normalizedCode)) {
            throw new DuplicateResourceException("Sản phẩm", "productCode", normalizedCode);
        }

        Product product = new Product(normalizedCode, normalizedName, categoryId, initialQuantity);
        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(Integer id, String productCode, String name, Integer categoryId) {
        Product existing = getProductById(id);
        String normalizedCode = validateAndNormalizeCode(productCode);
        String normalizedName = validateAndNormalizeName(name);
        ensureCategoryExists(categoryId);

        productRepository.findByProductCode(normalizedCode)
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> {
                    throw new DuplicateResourceException("Sản phẩm", "productCode", normalizedCode);
                });

        existing.setProductCode(normalizedCode);
        existing.setName(normalizedName);
        existing.setCategoryId(categoryId);
        existing.touchUpdatedAt();
        return productRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteProduct(Integer id) {
        Product existing = getProductById(id);
        // Xóa vĩnh viễn cả lịch sử nhập xuất liên quan đến sản phẩm này
        importRecordRepository.deleteByProductCode(existing.getProductCode());
        exportRecordRepository.deleteByProductCode(existing.getProductCode());
        productRepository.deleteById(existing.getId());
    }

    @Override
    @Transactional
    public void deleteAllProducts() {
        // Xóa vĩnh viễn tất cả lịch sử và sản phẩm
        importRecordRepository.deleteAll();
        exportRecordRepository.deleteAll();
        productRepository.deleteAll();
    }

    private void ensureCategoryExists(Integer categoryId) {
        if (categoryId == null || !categoryRepository.findById(categoryId).isPresent()) {
            throw new ResourceNotFoundException("Danh mục", "id", categoryId);
        }
    }

    private String validateAndNormalizeCode(String productCode) {
        if (productCode == null || productCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        return productCode.trim();
    }

    private String validateAndNormalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }
        return name.trim();
    }
}

package org.example.qlk_be.presentation.controller;

import org.example.qlk_be.application.usecase.ProductFileUseCase;
import org.example.qlk_be.application.usecase.ProductUseCase;
import org.example.qlk_be.domain.model.Product;
import org.example.qlk_be.presentation.dto.ProductRequest;
import org.example.qlk_be.presentation.dto.ProductResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductUseCase productUseCase;
    private final ProductFileUseCase productFileUseCase;

    public ProductController(ProductUseCase productUseCase, ProductFileUseCase productFileUseCase) {
        this.productUseCase = productUseCase;
        this.productFileUseCase = productFileUseCase;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll(@RequestParam(required = false) String keyword) {
        List<Product> list = (keyword != null && !keyword.isBlank())
                ? productUseCase.searchProducts(keyword.trim())
                : productUseCase.getAllProducts();
        return ResponseEntity.ok(list.stream().map(ProductResponse::fromDomain).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ProductResponse.fromDomain(productUseCase.getProductById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ProductResponse> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ProductResponse.fromDomain(productUseCase.getProductByCode(code)));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(@PathVariable Integer categoryId) {
        List<Product> list = productUseCase.getProductsByCategory(categoryId);
        return ResponseEntity.ok(list.stream().map(ProductResponse::fromDomain).toList());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@RequestBody ProductRequest request) {
        Product created = productUseCase.createProduct(
                request.getProductCode(),
                request.getName(),
                request.getCategoryId(),
                request.getInitialQuantity()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable Integer id, @RequestBody ProductRequest request) {
        Product updated = productUseCase.updateProduct(
                id,
                request.getProductCode(),
                request.getName(),
                request.getCategoryId()
        );
        return ResponseEntity.ok(ProductResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productUseCase.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // XÓA VĨNH VIỄN TẤT CẢ SẢN PHẨM (DÀNH CHO QUẢN LÝ)
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll() {
        productUseCase.deleteAllProducts();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/excel/import")
    public ResponseEntity<List<ProductResponse>> importExcel(@RequestParam("file") MultipartFile file) throws IOException {
        List<Product> imported = productFileUseCase.importProductsFromExcel(
                file.getInputStream(),
                file.getOriginalFilename()
        );
        return ResponseEntity.ok(imported.stream().map(ProductResponse::fromDomain).toList());
    }

    @GetMapping("/excel/export")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] data = productFileUseCase.exportProductsToExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"products.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/csv/export")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] data = productFileUseCase.exportProductsToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"products.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(data);
    }
}

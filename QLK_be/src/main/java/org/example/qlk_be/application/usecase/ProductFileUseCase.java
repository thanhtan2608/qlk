package org.example.qlk_be.application.usecase;

import org.example.qlk_be.domain.model.Product;

import java.io.InputStream;
import java.util.List;

public interface ProductFileUseCase {

    /**
     * Đọc file Excel (.xlsx) từ InputStream, validate dữ liệu và lưu/cập nhật sản phẩm.
     * Trả về danh sách sản phẩm đã xử lý thành công.
     */
    List<Product> importProductsFromExcel(InputStream excelInputStream, String fileName);

    /**
     * Xuất toàn bộ danh sách sản phẩm ra mảng byte của file Excel (.xlsx).
     */
    byte[] exportProductsToExcel();

    /**
     * Xuất toàn bộ danh sách sản phẩm ra mảng byte của file CSV (.csv, UTF-8 BOM).
     */
    byte[] exportProductsToCsv();
}
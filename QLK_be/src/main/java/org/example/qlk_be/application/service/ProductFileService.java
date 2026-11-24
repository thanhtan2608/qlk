package org.example.qlk_be.application.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.qlk_be.application.usecase.ProductFileUseCase;
import org.example.qlk_be.domain.exception.InvalidBusinessRuleException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.example.qlk_be.domain.model.Product;
import org.example.qlk_be.domain.repository.CategoryRepository;
import org.example.qlk_be.domain.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductFileService implements ProductFileUseCase {

    private static final String[] HEADERS = {"Mã sản phẩm", "Tên sản phẩm", "ID Danh mục", "Số lượng tồn", "Cập nhật lúc"};

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductFileService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public List<Product> importProductsFromExcel(InputStream excelInputStream, String fileName) {
        if (excelInputStream == null) {
            throw new IllegalArgumentException("File nhập không được để trống");
        }
        if (fileName != null && !fileName.toLowerCase().endsWith(".xlsx")) {
            throw new InvalidBusinessRuleException("Chỉ hỗ trợ file Excel định dạng .xlsx");
        }

        List<Product> importedProducts = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = new XSSFWorkbook(excelInputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getLastRowNum() < 1) {
                throw new InvalidBusinessRuleException("File Excel không có dữ liệu sản phẩm");
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowEmpty(row, formatter)) {
                    continue;
                }

                String productCode = formatter.formatCellValue(row.getCell(0)).trim();
                String name = formatter.formatCellValue(row.getCell(1)).trim();
                String categoryIdStr = formatter.formatCellValue(row.getCell(2)).trim();
                String quantityStr = formatter.formatCellValue(row.getCell(3)).trim();

                if (productCode.isEmpty() || name.isEmpty() || categoryIdStr.isEmpty()) {
                    throw new IllegalArgumentException(
                            "Dòng " + (rowIndex + 1) + ": Thiếu mã sản phẩm, tên sản phẩm hoặc ID danh mục"
                    );
                }

                Integer categoryId = parsePositiveInt(categoryIdStr, "ID danh mục", rowIndex + 1);
                int quantity = quantityStr.isEmpty() ? 0 : parseNonNegativeInt(quantityStr, "Số lượng tồn", rowIndex + 1);

                if (!categoryRepository.findById(categoryId).isPresent()) {
                    throw new ResourceNotFoundException("Danh mục", "id", categoryId);
                }

                Product product = productRepository.findByProductCode(productCode)
                        .map(existing -> {
                            existing.setName(name);
                            existing.setCategoryId(categoryId);
                            existing.setQuantity(quantity);
                            existing.touchUpdatedAt();
                            return existing;
                        })
                        .orElseGet(() -> new Product(productCode, name, categoryId, quantity));

                importedProducts.add(productRepository.save(product));
            }
        } catch (IOException e) {
            throw new InvalidBusinessRuleException("Không thể đọc file Excel: " + e.getMessage());
        }

        return importedProducts;
    }

    @Override
    public byte[] exportProductsToExcel() {
        List<Product> products = productRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
            }

            int rowIdx = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(nullToEmpty(product.getProductCode()));
                row.createCell(1).setCellValue(nullToEmpty(product.getName()));
                row.createCell(2).setCellValue(product.getCategoryId() != null ? product.getCategoryId() : 0);
                row.createCell(3).setCellValue(product.getQuantity());
                row.createCell(4).setCellValue(product.getUpdatedAt() != null ? product.getUpdatedAt().toString() : "");
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new InvalidBusinessRuleException("Không thể xuất file Excel: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportProductsToCsv() {
        List<Product> products = productRepository.findAll();
        StringBuilder sb = new StringBuilder();
        // UTF-8 BOM để mở bằng Excel tiếng Việt không bị lỗi font
        sb.append('\uFEFF');
        sb.append("Ma san pham,Ten san pham,ID Danh muc,So luong ton,Cap nhat luc\n");

        for (Product product : products) {
            sb.append(escapeCsv(product.getProductCode())).append(',')
                    .append(escapeCsv(product.getName())).append(',')
                    .append(product.getCategoryId() != null ? product.getCategoryId() : "").append(',')
                    .append(product.getQuantity()).append(',')
                    .append(escapeCsv(product.getUpdatedAt() != null ? product.getUpdatedAt().toString() : ""))
                    .append('\n');
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private boolean isRowEmpty(Row row, DataFormatter formatter) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !formatter.formatCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private Integer parsePositiveInt(String raw, String fieldName, int rowNum) {
        try {
            int val = Integer.parseInt(raw);
            if (val <= 0) {
                throw new IllegalArgumentException("Dòng " + rowNum + ": " + fieldName + " phải lớn hơn 0");
            }
            return val;
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Dòng " + rowNum + ": " + fieldName + " không hợp lệ ('" + raw + "')");
        }
    }

    private int parseNonNegativeInt(String raw, String fieldName, int rowNum) {
        try {
            int val = Integer.parseInt(raw);
            if (val < 0) {
                throw new IllegalArgumentException("Dòng " + rowNum + ": " + fieldName + " không được nhỏ hơn 0");
            }
            return val;
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Dòng " + rowNum + ": " + fieldName + " không hợp lệ ('" + raw + "')");
        }
    }

    private String nullToEmpty(String val) {
        return val == null ? "" : val;
    }

    private String escapeCsv(String val) {
        if (val == null) {
            return "";
        }
        String escaped = val.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}
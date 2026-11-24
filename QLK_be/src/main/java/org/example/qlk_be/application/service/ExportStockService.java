package org.example.qlk_be.application.service;

import org.example.qlk_be.application.usecase.ExportStockUseCase;
import org.example.qlk_be.domain.exception.InsufficientStockException;
import org.example.qlk_be.domain.exception.InvalidBusinessRuleException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.example.qlk_be.domain.model.ExportRecord;
import org.example.qlk_be.domain.model.Product;
import org.example.qlk_be.domain.model.User;
import org.example.qlk_be.domain.repository.ExportRecordRepository;
import org.example.qlk_be.domain.repository.ProductRepository;
import org.example.qlk_be.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExportStockService implements ExportStockUseCase {

    private final ExportRecordRepository exportRecordRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ExportStockService(ExportRecordRepository exportRecordRepository,
                              ProductRepository productRepository,
                              UserRepository userRepository) {
        this.exportRecordRepository = exportRecordRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ExportRecord> getAllExports() {
        return exportRecordRepository.findAll();
    }

    @Override
    public ExportRecord getExportById(Integer id) {
        return exportRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu xuất kho", "id", id));
    }

    @Override
    public List<ExportRecord> getExportsByProductCode(String productCode) {
        return exportRecordRepository.findByProductCode(productCode);
    }

    @Override
    public List<ExportRecord> getExportsByDateRange(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return exportRecordRepository.findByExportDateBetween(startDate, endDate);
    }

    @Override
    @Transactional
    public ExportRecord exportStock(String productCode, int quantity, Integer userId) {
        if (productCode == null || productCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng xuất phải lớn hơn 0");
        }

        String normalizedCode = productCode.trim();
        Product product = productRepository.findByProductCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "productCode", normalizedCode));

        User actor = validateActiveUser(userId);

        if (product.getQuantity() < quantity) {
            throw new InsufficientStockException(product.getProductCode(), product.getQuantity(), quantity);
        }

        product.decreaseStock(quantity);
        productRepository.save(product);

        ExportRecord record = new ExportRecord(product.getProductCode(), product.getName(), quantity, actor.getId());
        return exportRecordRepository.save(record);
    }

    @Override
    @Transactional
    public void deleteExport(Integer id) {
        exportRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu xuất kho", "id", id));
        exportRecordRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteExportsByProductCode(String productCode) {
        if (productCode != null && !productCode.isBlank()) {
            exportRecordRepository.deleteByProductCode(productCode.trim());
        }
    }

    @Override
    @Transactional
    public void clearAllExports() {
        exportRecordRepository.deleteAll();
    }

    private User validateActiveUser(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Người thực hiện phiếu xuất không được để trống");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));
        if (!user.isActive()) {
            throw new InvalidBusinessRuleException("Tài khoản người dùng đang bị khóa, không thể tạo phiếu xuất");
        }
        return user;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được sau ngày kết thúc");
        }
    }
}

package org.example.qlk_be.application.service;

import org.example.qlk_be.application.usecase.ImportStockUseCase;
import org.example.qlk_be.domain.exception.InvalidBusinessRuleException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.example.qlk_be.domain.model.ImportRecord;
import org.example.qlk_be.domain.model.Product;
import org.example.qlk_be.domain.model.User;
import org.example.qlk_be.domain.repository.ImportRecordRepository;
import org.example.qlk_be.domain.repository.ProductRepository;
import org.example.qlk_be.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ImportStockService implements ImportStockUseCase {

    private final ImportRecordRepository importRecordRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ImportStockService(ImportRecordRepository importRecordRepository,
                              ProductRepository productRepository,
                              UserRepository userRepository) {
        this.importRecordRepository = importRecordRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ImportRecord> getAllImports() {
        return importRecordRepository.findAll();
    }

    @Override
    public ImportRecord getImportById(Integer id) {
        return importRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu nhập kho", "id", id));
    }

    @Override
    public List<ImportRecord> getImportsByProductCode(String productCode) {
        return importRecordRepository.findByProductCode(productCode);
    }

    @Override
    public List<ImportRecord> getImportsByDateRange(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return importRecordRepository.findByImportDateBetween(startDate, endDate);
    }

    @Override
    @Transactional
    public ImportRecord importStock(String productCode, int quantity, Integer userId) {
        if (productCode == null || productCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
        }

        String normalizedCode = productCode.trim();
        Product product = productRepository.findByProductCode(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "productCode", normalizedCode));

        User actor = validateActiveUser(userId);

        product.increaseStock(quantity);
        productRepository.save(product);

        ImportRecord record = new ImportRecord(product.getProductCode(), product.getName(), quantity, actor.getId());
        return importRecordRepository.save(record);
    }

    @Override
    @Transactional
    public void deleteImport(Integer id) {
        importRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu nhập kho", "id", id));
        importRecordRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteImportsByProductCode(String productCode) {
        if (productCode != null && !productCode.isBlank()) {
            importRecordRepository.deleteByProductCode(productCode.trim());
        }
    }

    @Override
    @Transactional
    public void clearAllImports() {
        importRecordRepository.deleteAll();
    }

    private User validateActiveUser(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Người thực hiện phiếu nhập không được để trống");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));
        if (!user.isActive()) {
            throw new InvalidBusinessRuleException("Tài khoản người dùng đang bị khóa, không thể tạo phiếu nhập");
        }
        return user;
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngày bắt đầu không được sau ngày kết thúc");
        }
    }
}

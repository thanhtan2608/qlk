package org.example.qlk_be.domain.exception;

public class InsufficientStockException extends DomainException {

    public InsufficientStockException(String message) {
        super(message);
    }

    public InsufficientStockException(String productCode, int availableQuantity, int requestedQuantity) {
        super(String.format(
                "Sản phẩm '%s' không đủ tồn kho (Tồn hiện tại: %d, yêu cầu xuất: %d)",
                productCode, availableQuantity, requestedQuantity
        ));
    }
}
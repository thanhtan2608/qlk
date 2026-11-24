package org.example.qlk_be.presentation.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.example.qlk_be.domain.exception.DuplicateResourceException;
import org.example.qlk_be.domain.exception.InsufficientStockException;
import org.example.qlk_be.domain.exception.InvalidBusinessRuleException;
import org.example.qlk_be.domain.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleConflict(DuplicateResourceException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), req);
    }

    @ExceptionHandler({InsufficientStockException.class, InvalidBusinessRuleException.class})
    public ResponseEntity<ErrorResponse> handleBusinessRule(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), req);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest req) {
        // Thông báo lỗi server theo đúng yêu cầu: "Yêu cầu admin sửa chữa"
        String detail = ex.getMessage() != null ? " (" + ex.getMessage() + ")" : "";
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Yêu cầu admin sửa chữa" + detail, req);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest req) {
        ErrorResponse body = new ErrorResponse(status.value(), status.getReasonPhrase(), message, req.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}

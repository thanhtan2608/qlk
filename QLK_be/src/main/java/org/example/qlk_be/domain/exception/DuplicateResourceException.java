package org.example.qlk_be.domain.exception;

public class DuplicateResourceException extends DomainException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s với %s = '%s' đã tồn tại", resourceName, fieldName, fieldValue));
    }
}
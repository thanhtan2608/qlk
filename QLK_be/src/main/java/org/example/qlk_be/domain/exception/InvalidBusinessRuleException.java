package org.example.qlk_be.domain.exception;

public class InvalidBusinessRuleException extends DomainException {

    public InvalidBusinessRuleException(String message) {
        super(message);
    }
}
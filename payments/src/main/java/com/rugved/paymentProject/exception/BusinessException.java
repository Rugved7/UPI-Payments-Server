package com.rugved.paymentProject.exception;

public class BusinessException extends RuntimeException {

    private final String errorCode;

    public BusinessException(String messsage) {
        super(messsage);
        this.errorCode = "BUSINESS_ERROR";
    }

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public static class ErrorCodes {
        public static final String INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE";
        public static final String INVALID_UPI_PIN = "INVALID_UPI_PIN";
        public static final String VPA_NOT_FOUND = "VPA_NOT_FOUND";
        public static final String TRANSACTION_NOT_FOUND = "TRANSACTION_NOT_FOUND";
        public static final String BANK_ACCOUNT_NOT_LINKED = "BANK_ACCOUNT_NOT_LINKED";
        public static final String WALLET_NOT_FOUND = "WALLET_NOT_FOUND";
        public static final String WALLET_ALREADY_EXISTS = "WALLET_ALREADY_EXISTS";
        public static final String WALLET_INACTIVE = "WALLET_INACTIVE";
        public static final String DAILY_LIMIT_EXCEEDED = "DAILY_LIMIT_EXCEEDED";
        public static final String TRANSACTION_LIMIT_EXCEEDED = "TRANSACTION_LIMIT_EXCEEDED";
        public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
        public static final String VPA_ALREADY_EXISTS = "VPA_ALREADY_EXISTS";
        public static final String PRIMARY_VPA_NOT_FOUND = "PRIMARY_VPA_NOT_FOUND";
        public static final String INVALID_TRANSACTION = "INVALID_TRANSACTION";
    }
}

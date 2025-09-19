package com.rugved.paymentProject.dto;

import com.rugved.paymentProject.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private String transactionId;
    private Transaction.TransactionType type;
    private Transaction.TransactionStatus status;
    private BigDecimal amount;
    private String description;
    private String senderVpa;
    private String recieverVpa;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TransactionResponse fromTransaction(Transaction transaction) {
        return new TransactionResponse(
                transaction.getTransactionId(),
                transaction.getType(),
                transaction.getStatus(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getSenderVpa(),
                transaction.getReceiverVpa(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}

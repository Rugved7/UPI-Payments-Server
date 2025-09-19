package com.rugved.paymentProject.service;

import com.rugved.paymentProject.dto.TransactionRequest;
import com.rugved.paymentProject.dto.TransactionResponse;
import org.springframework.scheduling.annotation.Async;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface TransactionService {
    @Async("transactionTaskExecutor")
    CompletableFuture<TransactionResponse> initiateTransaction(TransactionRequest request, Long userId);

    TransactionResponse getTransaction(String transactionId, Long userId); // get transaction by Id

    List<TransactionResponse> getUserTransactions(Long userId); // get user's transaction history

    void processingPendingTransactions();  // Process pending transactions (batch processing)

    String generateTransactionId(); // Helper method to generate unique transaction ID
}

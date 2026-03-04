package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.dto.TransactionRequest;
import com.rugved.paymentProject.dto.TransactionResponse;
import com.rugved.paymentProject.model.BankAccount;
import com.rugved.paymentProject.model.Transaction;
import com.rugved.paymentProject.model.VirtualPaymentAddress;
import com.rugved.paymentProject.repository.BankAccountRepository;
import com.rugved.paymentProject.repository.TransactionRepository;
import com.rugved.paymentProject.repository.VpaRepository;
import com.rugved.paymentProject.service.TransactionService;
import com.rugved.paymentProject.service.UPIPinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final VpaRepository vpaRepository;
    private final com.rugved.paymentProject.repository.WalletRepository walletRepository;
    private final UPIPinService upiPinService;
    private final com.rugved.paymentProject.service.NotificationService notificationService;

    @Override
    @Async("transactionTaskExecutor")
    @Transactional
    public CompletableFuture<TransactionResponse> initiateTransaction(TransactionRequest request, Long userId) {
        try {
            // Validate UPI PIN
            if (!upiPinService.validateUPIPin(userId, request.getUpiPin())) {
                throw new com.rugved.paymentProject.exception.BusinessException("Invalid UPI Pin", 
                    com.rugved.paymentProject.exception.BusinessException.ErrorCodes.INVALID_UPI_PIN);
            }

            // Get sender primary VPA and wallet
            VirtualPaymentAddress senderVpa = vpaRepository.findByUserIdAndIsPrimaryTrue(userId)
                    .orElseThrow(() -> new com.rugved.paymentProject.exception.BusinessException("No Primary VPA Found", 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.PRIMARY_VPA_NOT_FOUND));

            var senderWallet = walletRepository.findByUserIdWithLock(userId)
                    .orElseThrow(() -> new com.rugved.paymentProject.exception.BusinessException("Wallet not found", 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.WALLET_NOT_FOUND));

            // Get receiver's VPA
            VirtualPaymentAddress receiverVpa = vpaRepository.findByVpa(request.getRecieverVpa())
                    .orElseThrow(() -> new com.rugved.paymentProject.exception.BusinessException(
                        "The VPA '" + request.getRecieverVpa() + "' does not exist. Please verify and try again.", 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.VPA_NOT_FOUND));

            // Prevent self-transfer
            if (receiverVpa.getUser().getId().equals(userId)) {
                throw new com.rugved.paymentProject.exception.BusinessException(
                    "You cannot send money to yourself", 
                    com.rugved.paymentProject.exception.BusinessException.ErrorCodes.INVALID_TRANSACTION);
            }

            // Validate transaction limits and balance
            if (!senderWallet.canTransact(request.getAmount())) {
                if (!senderWallet.getIsActive()) {
                    throw new com.rugved.paymentProject.exception.BusinessException("Wallet is inactive", 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.WALLET_INACTIVE);
                }
                if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
                    throw new com.rugved.paymentProject.exception.BusinessException("Insufficient balance", 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.INSUFFICIENT_BALANCE);
                }
                if (request.getAmount().compareTo(senderWallet.getPerTransactionLimit()) > 0) {
                    throw new com.rugved.paymentProject.exception.BusinessException("Transaction limit exceeded. Max: ₹" + senderWallet.getPerTransactionLimit(), 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.TRANSACTION_LIMIT_EXCEEDED);
                }
                if (senderWallet.getDailySpent().add(request.getAmount()).compareTo(senderWallet.getDailyLimit()) > 0) {
                    throw new com.rugved.paymentProject.exception.BusinessException("Daily limit exceeded. Remaining: ₹" + 
                        senderWallet.getDailyLimit().subtract(senderWallet.getDailySpent()), 
                        com.rugved.paymentProject.exception.BusinessException.ErrorCodes.DAILY_LIMIT_EXCEEDED);
                }
            }

            // Create transaction record
            Transaction transaction = Transaction.builder()
                    .transactionId(generateTransactionId())
                    .type(Transaction.TransactionType.P2P_TRANSFER)
                    .status(Transaction.TransactionStatus.PROCESSING)
                    .amount(request.getAmount())
                    .description(request.getDescription())
                    .sender(senderVpa.getUser())
                    .receiver(receiverVpa.getUser())
                    .senderVpa(senderVpa.getVpa())
                    .receiverVpa(receiverVpa.getVpa())
                    .build();

            transaction = transactionRepository.save(transaction);

            // Perform fund transfer
            performFundTransfer(senderWallet, receiverVpa, request.getAmount());

            // Update status
            transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
            transactionRepository.save(transaction);

            // Send notifications
            notificationService.createNotification(
                userId,
                "Money Sent",
                "₹" + request.getAmount() + " sent to " + request.getRecieverVpa(),
                com.rugved.paymentProject.model.Notification.NotificationType.MONEY_SENT,
                transaction.getTransactionId()
            );

            notificationService.createNotification(
                receiverVpa.getUser().getId(),
                "Money Received",
                "₹" + request.getAmount() + " received from " + senderVpa.getVpa(),
                com.rugved.paymentProject.model.Notification.NotificationType.MONEY_RECEIVED,
                transaction.getTransactionId()
            );

            return CompletableFuture.completedFuture(TransactionResponse.fromTransaction(transaction));
        } catch (Exception e) {
            log.error("Transaction Failed: {}", e.getMessage());
            Transaction failedTransaction = createFailedTransaction(request, userId, e.getMessage());
            
            // Notify sender about failed transaction
            notificationService.createNotification(
                userId,
                "Transaction Failed",
                "Failed to send ₹" + request.getAmount() + " to " + request.getRecieverVpa() + ". Reason: " + e.getMessage(),
                com.rugved.paymentProject.model.Notification.NotificationType.TRANSACTION_FAILED,
                failedTransaction.getTransactionId()
            );
            
            return CompletableFuture.completedFuture(TransactionResponse.fromTransaction(failedTransaction));
        }
    }

    @Transactional
    protected void performFundTransfer(com.rugved.paymentProject.model.Wallet senderWallet, 
                                      VirtualPaymentAddress receiverVpa, BigDecimal amount) {
        // Debit sender wallet
        senderWallet.debit(amount);
        walletRepository.save(senderWallet);

        // Credit receiver wallet
        var receiverWallet = walletRepository.findByUserId(receiverVpa.getUser().getId())
                .orElseThrow(() -> new com.rugved.paymentProject.exception.BusinessException("Receiver wallet not found", 
                    com.rugved.paymentProject.exception.BusinessException.ErrorCodes.WALLET_NOT_FOUND));
        
        receiverWallet.credit(amount);
        walletRepository.save(receiverWallet);
    }

    private Transaction createFailedTransaction(TransactionRequest request, Long userId, String errorMessage) {
        VirtualPaymentAddress senderVpa = vpaRepository.findByUserIdAndIsPrimaryTrue(userId)
                .orElseThrow(() -> new RuntimeException("No primary VPA found"));

        Transaction transaction = Transaction.builder()
                .transactionId(generateTransactionId())
                .type(Transaction.TransactionType.P2P_TRANSFER)
                .status(Transaction.TransactionStatus.FAILED)
                .amount(request.getAmount())
                .description("Failed: " + errorMessage)
                .sender(senderVpa.getUser())
                .senderVpa(senderVpa.getVpa())
                .receiverVpa(request.getRecieverVpa())
                .build();

        return transactionRepository.save(transaction);
    }

    @Override
    public TransactionResponse getTransaction(String transactionId, Long userId) {
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Security check: user must be either sender or receiver
        if (!transaction.getSender().getId().equals(userId) &&
                !transaction.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return TransactionResponse.fromTransaction(transaction);
    }

    @Override
    public List<TransactionResponse> getUserTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        return transactions.stream()
                .map(TransactionResponse::fromTransaction)
                .collect(Collectors.toList());
    }

    @Override
    public void processingPendingTransactions() {
        log.info("Processing pending transactions...");
    }

    @Override
    public String generateTransactionId() {
        return "UPI" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

package com.rugved.paymentProject.service.impl;

import com.rugved.paymentProject.dto.PaymentRequestDto;
import com.rugved.paymentProject.dto.PaymentRequestResponse;
import com.rugved.paymentProject.dto.TransactionRequest;
import com.rugved.paymentProject.exception.BusinessException;
import com.rugved.paymentProject.model.PaymentRequest;
import com.rugved.paymentProject.model.VirtualPaymentAddress;
import com.rugved.paymentProject.repository.PaymentRequestRepository;
import com.rugved.paymentProject.repository.VpaRepository;
import com.rugved.paymentProject.service.NotificationService;
import com.rugved.paymentProject.service.PaymentRequestService;
import com.rugved.paymentProject.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentRequestServiceImpl implements PaymentRequestService {

    private final PaymentRequestRepository requestRepository;
    private final VpaRepository vpaRepository;
    private final TransactionService transactionService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PaymentRequestResponse createRequest(PaymentRequestDto dto, Long requesterId) {
        // Get requester's primary VPA
        VirtualPaymentAddress requesterVpa = vpaRepository.findByUserIdAndIsPrimaryTrue(requesterId)
                .orElseThrow(() -> new BusinessException("No primary VPA found", 
                    BusinessException.ErrorCodes.PRIMARY_VPA_NOT_FOUND));

        // Validate payer VPA exists
        VirtualPaymentAddress payerVpa = vpaRepository.findByVpa(dto.getPayerVpa())
                .orElseThrow(() -> new BusinessException("Payer VPA not found", 
                    BusinessException.ErrorCodes.VPA_NOT_FOUND));

        // Prevent self-request
        if (payerVpa.getUser().getId().equals(requesterId)) {
            throw new BusinessException("You cannot request money from yourself", 
                BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        // Create payment request
        PaymentRequest request = PaymentRequest.builder()
                .requestId(generateRequestId())
                .requester(requesterVpa.getUser())
                .requesterVpa(requesterVpa.getVpa())
                .payer(payerVpa.getUser())
                .payerVpa(payerVpa.getVpa())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .status(PaymentRequest.RequestStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7)) // 7 days expiry
                .build();

        request = requestRepository.save(request);

        // Notify payer
        notificationService.createNotification(
            payerVpa.getUser().getId(),
            "Payment Request",
            requesterVpa.getVpa() + " requested ₹" + dto.getAmount(),
            com.rugved.paymentProject.model.Notification.NotificationType.MONEY_RECEIVED,
            request.getRequestId()
        );

        log.info("Payment request created: {}", request.getRequestId());
        return PaymentRequestResponse.fromEntity(request);
    }

    @Override
    @Transactional
    public PaymentRequestResponse acceptRequest(String requestId, Long payerId, String upiPin) {
        PaymentRequest request = requestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new BusinessException("Payment request not found", 
                    BusinessException.ErrorCodes.TRANSACTION_NOT_FOUND));

        // Validate payer
        if (!request.getPayer().getId().equals(payerId)) {
            throw new BusinessException("Access denied", BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        // Check status
        if (request.getStatus() != PaymentRequest.RequestStatus.PENDING) {
            throw new BusinessException("Request is not pending", BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        // Check expiry
        if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
            request.setStatus(PaymentRequest.RequestStatus.EXPIRED);
            requestRepository.save(request);
            throw new BusinessException("Request has expired", BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        // Process transaction
        TransactionRequest transactionRequest = new TransactionRequest();
        transactionRequest.setRecieverVpa(request.getRequesterVpa());
        transactionRequest.setAmount(request.getAmount());
        transactionRequest.setDescription("Payment for request: " + request.getDescription());
        transactionRequest.setUpiPin(upiPin);

        try {
            var transactionResponse = transactionService.initiateTransaction(transactionRequest, payerId).get();
            
            if (transactionResponse.getStatus() == com.rugved.paymentProject.model.Transaction.TransactionStatus.SUCCESS) {
                request.setStatus(PaymentRequest.RequestStatus.COMPLETED);
                request.setTransactionId(transactionResponse.getTransactionId());
            } else {
                request.setStatus(PaymentRequest.RequestStatus.REJECTED);
            }
        } catch (Exception e) {
            request.setStatus(PaymentRequest.RequestStatus.REJECTED);
            throw new BusinessException("Transaction failed: " + e.getMessage(), 
                BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        requestRepository.save(request);

        // Notify requester
        notificationService.createNotification(
            request.getRequester().getId(),
            "Request Accepted",
            request.getPayerVpa() + " paid ₹" + request.getAmount(),
            com.rugved.paymentProject.model.Notification.NotificationType.MONEY_RECEIVED,
            request.getRequestId()
        );

        return PaymentRequestResponse.fromEntity(request);
    }

    @Override
    @Transactional
    public PaymentRequestResponse rejectRequest(String requestId, Long payerId) {
        PaymentRequest request = requestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new BusinessException("Payment request not found", 
                    BusinessException.ErrorCodes.TRANSACTION_NOT_FOUND));

        // Validate payer
        if (!request.getPayer().getId().equals(payerId)) {
            throw new BusinessException("Access denied", BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        // Check status
        if (request.getStatus() != PaymentRequest.RequestStatus.PENDING) {
            throw new BusinessException("Request is not pending", BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        request.setStatus(PaymentRequest.RequestStatus.REJECTED);
        requestRepository.save(request);

        // Notify requester
        notificationService.createNotification(
            request.getRequester().getId(),
            "Request Rejected",
            request.getPayerVpa() + " rejected your payment request",
            com.rugved.paymentProject.model.Notification.NotificationType.TRANSACTION_FAILED,
            request.getRequestId()
        );

        return PaymentRequestResponse.fromEntity(request);
    }

    @Override
    public PaymentRequestResponse getRequest(String requestId, Long userId) {
        PaymentRequest request = requestRepository.findByRequestId(requestId)
                .orElseThrow(() -> new BusinessException("Payment request not found", 
                    BusinessException.ErrorCodes.TRANSACTION_NOT_FOUND));

        // Validate access
        if (!request.getRequester().getId().equals(userId) && !request.getPayer().getId().equals(userId)) {
            throw new BusinessException("Access denied", BusinessException.ErrorCodes.INVALID_TRANSACTION);
        }

        return PaymentRequestResponse.fromEntity(request);
    }

    @Override
    public List<PaymentRequestResponse> getSentRequests(Long userId) {
        return requestRepository.findByRequesterIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(PaymentRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentRequestResponse> getReceivedRequests(Long userId) {
        return requestRepository.findByPayerIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(PaymentRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentRequestResponse> getAllRequests(Long userId) {
        return requestRepository.findByUserId(userId)
                .stream()
                .map(PaymentRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public long getPendingRequestCount(Long userId) {
        return requestRepository.countByPayerIdAndStatus(userId, PaymentRequest.RequestStatus.PENDING);
    }

    @Override
    @Transactional
    public void expireOldRequests() {
        // This would be called by a scheduled job
        log.info("Expiring old payment requests...");
    }

    private String generateRequestId() {
        return "REQ" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}

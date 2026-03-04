package com.rugved.paymentProject.dto;

import com.rugved.paymentProject.model.PaymentRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestResponse {
    private Long id;
    private String requestId;
    private String requesterVpa;
    private String payerVpa;
    private BigDecimal amount;
    private String description;
    private PaymentRequest.RequestStatus status;
    private String transactionId;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PaymentRequestResponse fromEntity(PaymentRequest request) {
        return PaymentRequestResponse.builder()
                .id(request.getId())
                .requestId(request.getRequestId())
                .requesterVpa(request.getRequesterVpa())
                .payerVpa(request.getPayerVpa())
                .amount(request.getAmount())
                .description(request.getDescription())
                .status(request.getStatus())
                .transactionId(request.getTransactionId())
                .expiresAt(request.getExpiresAt())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}

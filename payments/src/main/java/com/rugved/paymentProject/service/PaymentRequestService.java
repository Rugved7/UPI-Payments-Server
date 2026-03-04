package com.rugved.paymentProject.service;

import com.rugved.paymentProject.dto.PaymentRequestDto;
import com.rugved.paymentProject.dto.PaymentRequestResponse;

import java.util.List;

public interface PaymentRequestService {
    PaymentRequestResponse createRequest(PaymentRequestDto dto, Long requesterId);
    PaymentRequestResponse acceptRequest(String requestId, Long payerId, String upiPin);
    PaymentRequestResponse rejectRequest(String requestId, Long payerId);
    PaymentRequestResponse getRequest(String requestId, Long userId);
    List<PaymentRequestResponse> getSentRequests(Long userId);
    List<PaymentRequestResponse> getReceivedRequests(Long userId);
    List<PaymentRequestResponse> getAllRequests(Long userId);
    long getPendingRequestCount(Long userId);
    void expireOldRequests();
}

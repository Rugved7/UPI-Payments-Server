package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.dto.PaymentRequestDto;
import com.rugved.paymentProject.dto.PaymentRequestResponse;
import com.rugved.paymentProject.security.UserPrincipal;
import com.rugved.paymentProject.service.PaymentRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payment-requests")
@RequiredArgsConstructor
public class PaymentRequestController {

    private final PaymentRequestService paymentRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse> createRequest(
            @Valid @RequestBody PaymentRequestDto dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PaymentRequestResponse response = paymentRequestService.createRequest(dto, userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Payment request created", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<ApiResponse> acceptRequest(
            @PathVariable String requestId,
            @RequestParam String upiPin,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PaymentRequestResponse response = paymentRequestService.acceptRequest(requestId, userPrincipal.getId(), upiPin);
            return ResponseEntity.ok(ApiResponse.success("Payment request accepted", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponse> rejectRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PaymentRequestResponse response = paymentRequestService.rejectRequest(requestId, userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Payment request rejected", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse> getRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            PaymentRequestResponse response = paymentRequestService.getRequest(requestId, userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Payment request retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sent")
    public ResponseEntity<ApiResponse> getSentRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PaymentRequestResponse> requests = paymentRequestService.getSentRequests(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Sent requests retrieved", requests));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse> getReceivedRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PaymentRequestResponse> requests = paymentRequestService.getReceivedRequests(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Received requests retrieved", requests));
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllRequests(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PaymentRequestResponse> requests = paymentRequestService.getAllRequests(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("All requests retrieved", requests));
    }

    @GetMapping("/pending/count")
    public ResponseEntity<ApiResponse> getPendingCount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        long count = paymentRequestService.getPendingRequestCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Pending count retrieved", count));
    }
}

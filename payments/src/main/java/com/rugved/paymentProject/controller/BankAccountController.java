package com.rugved.paymentProject.controller;

import com.rugved.paymentProject.dto.ApiResponse;
import com.rugved.paymentProject.model.BankAccount;
import com.rugved.paymentProject.repository.BankAccountRepository;
import com.rugved.paymentProject.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/bank-accounts")
@RequiredArgsConstructor
public class BankAccountController {

    private final BankAccountRepository bankAccountRepository;

    @PostMapping
    public ResponseEntity<ApiResponse> createBankAccount(
            @Valid @RequestBody BankAccountRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        BankAccount account = BankAccount.builder()
                .accountNumber(request.accountNumber())
                .ifscCode(request.ifscCode())
                .bankName(request.bankName())
                .balance(request.initialBalance())
                .isPrimary(true)
                .isVerified(true)
                .build();

        account = bankAccountRepository.save(account);
        return ResponseEntity.ok(ApiResponse.success("Bank account created", account));
    }
}

record BankAccountRequest(
        String accountNumber,
        String ifscCode,
        String bankName,
        BigDecimal initialBalance
) {
}

package com.rugved.paymentProject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_accounts", uniqueConstraints = {
        @UniqueConstraint(columnNames = "account_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank
    @Size(max = 20)
    @Column(name = "account_number")
    private String accountNumber;

    @NotBlank
    @Size(max = 11)
    @Column(name = "ifsc_code")
    private String ifscCode;

    @NotBlank
    @Size(max = 100)
    @Column(name = "bank_name")
    private String bankName;

    @Builder.Default
    @Column(name = "balance", precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Builder.Default
    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(name = "linked_at", updatable = false)
    private LocalDateTime linkedAt;
}

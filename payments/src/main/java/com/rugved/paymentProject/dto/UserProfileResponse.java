package com.rugved.paymentProject.dto;

import com.rugved.paymentProject.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Boolean isVerified;
    private Boolean isLocked;
    private Boolean hasUpiPin;
    private LocalDateTime createdAt;

    public static UserProfileResponse fromUser(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isVerified(user.getIsVerified())
                .isLocked(user.getIsLocked())
                .hasUpiPin(user.getUpiPinHash() != null && !user.getUpiPinHash().isEmpty())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

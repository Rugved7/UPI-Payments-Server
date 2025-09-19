package com.rugved.paymentProject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VpaRequest {

    @NotBlank(message = "VPA is Required")
    @Size(min = 3, max = 50, message = "VPA must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "VPA can only contain letters, numbers, dots, underscores and hyphens")
    private String Vpa;

    private Long bankAccountId;

    private Boolean isPrimary = false;
}

package com.rugved.paymentProject.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "First Name is Required")
    @Size(max = 50, message = "First name should be less than 50 Characters")
    private String Firstname;


    @NotBlank(message = "Last Name is Required")
    @Size(max = 50, message = "Last name should be less than 50 Characters")
    private String lastname;


    @NotBlank(message = "Email is Required")
    @Size(max = 50, message = "Email should be less than 50 Characters")
    @Email(message = "Email should be valid")
    private String email;


    @NotBlank(message = "Phone is Required")
    @Size(max = 15, message = "Phone should be less than 15 Characters")
    private String phone;

    @NotBlank(message = "Password is Required")
    @Size(min = 6, max = 50, message = "Password should be less than 50 Characters and more than 6 characters")
    private String password;
}

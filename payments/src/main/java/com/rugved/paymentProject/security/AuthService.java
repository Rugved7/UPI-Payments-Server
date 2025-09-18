package com.rugved.paymentProject.security;

import com.rugved.paymentProject.dto.SignupRequest;
import com.rugved.paymentProject.model.User;

public interface AuthService {
    User registerUser(SignupRequest signupRequest);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
